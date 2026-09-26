from datetime import datetime, timezone
from backend.database import db

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    user_name = db.Column(db.String(150), nullable=True)
    role = db.Column(db.String(50), nullable=True)
    action = db.Column(db.String(100), nullable=False, index=True)  # LOGIN, INSPECTION_ASSIGNED, GPS_VERIFIED, EVIDENCE_UPLOADED, REPORT_SUBMITTED, CORRECTIVE_ACTION_CREATED, RESOLUTION_VERIFIED, RISK_RECALCULATED
    entity_type = db.Column(db.String(100), nullable=True)  # Institute, Inspection, Evidence, CorrectiveAction, RiskScore
    entity_id = db.Column(db.String(100), nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    details = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user_name,
            "role": self.role,
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "ip_address": self.ip_address,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
