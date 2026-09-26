from datetime import datetime, timezone
from backend.database import db

class Evidence(db.Model):
    __tablename__ = "evidence"

    id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(db.Integer, db.ForeignKey("inspections.id"), nullable=False, index=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    inspector_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    evidence_type = db.Column(db.String(50), nullable=False)  # PHOTO, VIDEO, DOCUMENT
    category = db.Column(db.String(50), nullable=True)  # Attendance Register, Classroom, Laboratory, Staff Presence, Hostel, Kitchen
    file_url = db.Column(db.String(500), nullable=False)
    file_name = db.Column(db.String(255), nullable=True)
    file_size_bytes = db.Column(db.Integer, nullable=True)
    mime_type = db.Column(db.String(100), nullable=True)
    
    # Geo-tagging & authenticity metadata
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    accuracy_meters = db.Column(db.Float, nullable=True)
    device_info = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    captured_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    inspection = db.relationship("Inspection", back_populates="evidence")
    institute = db.relationship("Institute")
    inspector = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "inspection_id": self.inspection_id,
            "institute_id": self.institute_id,
            "inspector_id": self.inspector_id,
            "evidence_type": self.evidence_type,
            "category": self.category,
            "file_url": self.file_url,
            "file_name": self.file_name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "accuracy_meters": self.accuracy_meters,
            "description": self.description,
            "captured_at": self.captured_at.isoformat() if self.captured_at else None,
        }
