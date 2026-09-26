from datetime import datetime, timezone
from backend.database import db

class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    tracking_code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False)  # Food Quality, Staff Absenteeism, Facility Hygiene, Harassment, Allowance Delay
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(50), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    is_anonymous = db.Column(db.Boolean, default=False)
    complainant_name = db.Column(db.String(150), nullable=True)
    complainant_contact = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default="PENDING")  # PENDING, INVESTIGATING, RESOLVED, CLOSED
    resolution_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = db.Column(db.DateTime, nullable=True)

    institute = db.relationship("Institute", back_populates="complaints")

    def to_dict(self):
        return {
            "id": self.id,
            "institute_id": self.institute_id,
            "institute_name": self.institute.name if self.institute else None,
            "institute_state": self.institute.state if self.institute else None,
            "institute_district": self.institute.district if self.institute else None,
            "tracking_code": self.tracking_code,
            "category": self.category,
            "description": self.description,
            "severity": self.severity,
            "is_anonymous": self.is_anonymous,
            "complainant_name": "Anonymous" if self.is_anonymous else (self.complainant_name or "Concerned Citizen"),
            "complainant_contact": None if self.is_anonymous else self.complainant_contact,
            "status": self.status,
            "resolution_notes": self.resolution_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }
