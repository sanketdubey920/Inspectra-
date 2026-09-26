from datetime import datetime, timezone
from backend.database import db

class Staff(db.Model):
    __tablename__ = "staff"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False)
    designation = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default="PRESENT")  # PRESENT, ON_LEAVE, VACANT
    joined_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    institute = db.relationship("Institute", back_populates="staff")

    def to_dict(self):
        return {
            "id": self.id,
            "institute_id": self.institute_id,
            "name": self.name,
            "designation": self.designation,
            "qualification": self.qualification,
            "phone": self.phone,
            "status": self.status,
            "joined_date": self.joined_date.isoformat() if self.joined_date else None,
        }
