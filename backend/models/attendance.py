from datetime import datetime, timezone, date
from backend.database import db

class Attendance(db.Model):
    __tablename__ = "attendance"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    record_date = db.Column(db.Date, nullable=False, default=date.today, index=True)
    total_enrolled = db.Column(db.Integer, nullable=False)
    present_count = db.Column(db.Integer, nullable=False)
    reported_rate = db.Column(db.Float, nullable=False)  # e.g., 94.0 %
    verified_rate = db.Column(db.Float, nullable=True)   # from inspector check e.g. 68.0 %
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    institute = db.relationship("Institute", back_populates="attendance_records")

    def to_dict(self):
        return {
            "id": self.id,
            "institute_id": self.institute_id,
            "record_date": self.record_date.isoformat(),
            "total_enrolled": self.total_enrolled,
            "present_count": self.present_count,
            "reported_rate": self.reported_rate,
            "verified_rate": self.verified_rate,
            "notes": self.notes,
        }
