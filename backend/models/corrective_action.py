from datetime import datetime, timezone, date
from backend.database import db

class CorrectiveAction(db.Model):
    __tablename__ = "corrective_actions"

    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey("inspections.id"), nullable=True, index=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    issue_title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(50), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    deadline = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default="PENDING", index=True)  # PENDING, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, RESOLVED, REJECTED, CLARIFICATION_REQUIRED, OVERDUE
    
    # Resolution details submitted by Institute
    resolution_description = db.Column(db.Text, nullable=True)
    resolution_evidence_url = db.Column(db.String(500), nullable=True)
    submitted_at = db.Column(db.DateTime, nullable=True)

    # Official verification details
    verified_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    verification_remarks = db.Column(db.Text, nullable=True)
    verified_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    institute = db.relationship("Institute", back_populates="corrective_actions")
    inspection = db.relationship("Inspection", back_populates="corrective_actions")
    creator = db.relationship("User", foreign_keys=[created_by_id])
    verifier = db.relationship("User", foreign_keys=[verified_by_id])

    @property
    def is_overdue(self):
        if self.status in ("RESOLVED", "CLOSED"):
            return False
        return date.today() > self.deadline

    def to_dict(self):
        return {
            "id": self.id,
            "inspection_id": self.inspection_id,
            "institute_id": self.institute_id,
            "institute_name": self.institute.name if self.institute else None,
            "issue_title": self.issue_title,
            "description": self.description,
            "severity": self.severity,
            "deadline": self.deadline.isoformat(),
            "status": "OVERDUE" if self.is_overdue and self.status not in ("RESOLVED", "CLOSED") else self.status,
            "is_overdue": self.is_overdue,
            "resolution_description": self.resolution_description,
            "resolution_evidence_url": self.resolution_evidence_url,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
            "verified_by_id": self.verified_by_id,
            "verified_at": self.verified_at.isoformat() if self.verified_at else None,
            "verification_remarks": self.verification_remarks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
