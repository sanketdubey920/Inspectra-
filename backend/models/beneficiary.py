from datetime import datetime, timezone
from backend.database import db

class Beneficiary(db.Model):
    __tablename__ = "beneficiaries"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    beneficiary_code = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    gender = db.Column(db.String(20), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    category = db.Column(db.String(50), nullable=True)  # SC, ST, OBC, Senior Citizen, PwD
    admission_date = db.Column(db.Date, nullable=True)
    attendance_rate = db.Column(db.Float, default=90.0)
    status = db.Column(db.String(50), default="ACTIVE")  # ACTIVE, DISCHARGED, ABSENT
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    institute = db.relationship("Institute", back_populates="beneficiaries")

    def to_dict(self):
        return {
            "id": self.id,
            "institute_id": self.institute_id,
            "beneficiary_code": self.beneficiary_code,
            "name": self.name,
            "gender": self.gender,
            "age": self.age,
            "category": self.category,
            "admission_date": self.admission_date.isoformat() if self.admission_date else None,
            "attendance_rate": self.attendance_rate,
            "status": self.status,
        }
