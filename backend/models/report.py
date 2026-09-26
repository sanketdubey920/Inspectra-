from datetime import datetime, timezone
from backend.database import db

class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    report_type = db.Column(db.String(50), nullable=False)  # INSPECTION, RISK, COMPLIANCE, ATTENDANCE, STATE_WISE, CORRECTIVE_ACTION
    state = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    scheme = db.Column(db.String(200), nullable=True)
    format = db.Column(db.String(20), default="CSV")  # CSV, PDF, JSON
    file_path = db.Column(db.String(500), nullable=True)
    generated_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "report_type": self.report_type,
            "state": self.state,
            "district": self.district,
            "scheme": self.scheme,
            "format": self.format,
            "file_path": self.file_path,
            "generated_by_id": self.generated_by_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
