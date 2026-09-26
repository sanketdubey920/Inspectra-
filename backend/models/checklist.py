from datetime import datetime, timezone
from backend.database import db

class InspectionChecklist(db.Model):
    __tablename__ = "inspection_checklists"

    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey("inspections.id"), nullable=False, index=True)
    section = db.Column(db.String(50), nullable=False)  # Attendance, Staff, Beneficiaries, Infrastructure, Compliance, Documents
    item_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default="PENDING")  # PENDING, PASS, FAIL, NA
    notes = db.Column(db.Text, nullable=True)
    evidence_required = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    inspection = db.relationship("Inspection", back_populates="checklists")

    def to_dict(self):
        return {
            "id": self.id,
            "inspection_id": self.inspection_id,
            "section": self.section,
            "item_name": self.item_name,
            "description": self.description,
            "status": self.status,
            "notes": self.notes,
            "evidence_required": self.evidence_required,
        }
