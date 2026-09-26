from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from backend.database import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, index=True)  # department_official, inspection_officer, institute_representative, beneficiary
    phone = db.Column(db.String(20), nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(150), nullable=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=True)
    status = db.Column(db.String(20), default="ACTIVE")  # ACTIVE, INACTIVE, SUSPENDED
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    inspections = db.relationship("Inspection", back_populates="inspector", lazy="dynamic", foreign_keys="Inspection.inspector_id")
    notifications = db.relationship("Notification", back_populates="user", lazy="dynamic")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "designation": self.designation,
            "department": self.department,
            "institute_id": self.institute_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
