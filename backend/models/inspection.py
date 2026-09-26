from datetime import datetime, timezone
from backend.database import db

class Inspection(db.Model):
    __tablename__ = "inspections"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    inspector_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    inspection_type = db.Column(db.String(50), default="SURPRISE")  # SURPRISE, ROUTINE, COMPLAINT_BASED
    priority = db.Column(db.String(20), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    status = db.Column(db.String(50), default="ASSIGNED", index=True)  # ASSIGNED, IN_PROGRESS, SUBMITTED, REVIEWED, CLOSED
    
    # Reason and Triggering context
    trigger_risk_score = db.Column(db.Integer, nullable=True)
    trigger_risk_level = db.Column(db.String(50), nullable=True)
    trigger_reasons = db.Column(db.Text, nullable=True)  # JSON or comma-separated reasons
    special_instructions = db.Column(db.Text, nullable=True)

    # GPS Verification details
    expected_latitude = db.Column(db.Float, nullable=True)
    expected_longitude = db.Column(db.Float, nullable=True)
    verified_latitude = db.Column(db.Float, nullable=True)
    verified_longitude = db.Column(db.Float, nullable=True)
    gps_distance_meters = db.Column(db.Float, nullable=True)
    gps_verified = db.Column(db.Boolean, default=False)
    gps_verified_at = db.Column(db.DateTime, nullable=True)

    # Findings summary
    reported_attendance_pct = db.Column(db.Float, nullable=True)
    verified_attendance_pct = db.Column(db.Float, nullable=True)
    staff_present_count = db.Column(db.Integer, nullable=True)
    staff_total_count = db.Column(db.Integer, nullable=True)
    beneficiaries_verified_count = db.Column(db.Integer, nullable=True)
    observations = db.Column(db.Text, nullable=True)
    final_status = db.Column(db.String(50), nullable=True)  # COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, FURTHER_INSPECTION_REQUIRED

    # Review by Department Official
    reviewed_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    official_remarks = db.Column(db.Text, nullable=True)

    scheduled_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    started_at = db.Column(db.DateTime, nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    institute = db.relationship("Institute", back_populates="inspections")
    inspector = db.relationship("User", back_populates="inspections", foreign_keys=[inspector_id])
    reviewer = db.relationship("User", foreign_keys=[reviewed_by_id])
    checklists = db.relationship("InspectionChecklist", back_populates="inspection", cascade="all, delete-orphan")
    evidence = db.relationship("Evidence", back_populates="inspection", cascade="all, delete-orphan")
    corrective_actions = db.relationship("CorrectiveAction", back_populates="inspection")

    def to_dict(self, include_details=False):
        data = {
            "id": self.id,
            "institute_id": self.institute_id,
            "institute_name": self.institute.name if self.institute else None,
            "institute_state": self.institute.state if self.institute else None,
            "institute_district": self.institute.district if self.institute else None,
            "inspector_id": self.inspector_id,
            "inspector_name": self.inspector.name if self.inspector else None,
            "inspection_type": self.inspection_type,
            "priority": self.priority,
            "status": self.status,
            "trigger_risk_score": self.trigger_risk_score,
            "trigger_risk_level": self.trigger_risk_level,
            "trigger_reasons": self.trigger_reasons,
            "special_instructions": self.special_instructions,
            "expected_latitude": self.expected_latitude,
            "expected_longitude": self.expected_longitude,
            "verified_latitude": self.verified_latitude,
            "verified_longitude": self.verified_longitude,
            "gps_distance_meters": self.gps_distance_meters,
            "gps_verified": self.gps_verified,
            "gps_verified_at": self.gps_verified_at.isoformat() if self.gps_verified_at else None,
            "reported_attendance_pct": self.reported_attendance_pct,
            "verified_attendance_pct": self.verified_attendance_pct,
            "staff_present_count": self.staff_present_count,
            "staff_total_count": self.staff_total_count,
            "beneficiaries_verified_count": self.beneficiaries_verified_count,
            "observations": self.observations,
            "final_status": self.final_status,
            "reviewed_by_id": self.reviewed_by_id,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "official_remarks": self.official_remarks,
            "scheduled_date": self.scheduled_date.isoformat() if self.scheduled_date else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if include_details:
            data["checklists"] = [c.to_dict() for c in self.checklists]
            data["evidence"] = [e.to_dict() for e in self.evidence]
            data["corrective_actions"] = [ca.to_dict() for ca in self.corrective_actions]

        return data
