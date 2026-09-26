from datetime import datetime, timezone
from backend.database import db

class Anomaly(db.Model):
    __tablename__ = "anomalies"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    anomaly_type = db.Column(db.String(100), nullable=False)  # ATTENDANCE_SPIKE, ACTIVITY_DISCREPANCY, COMPLIANCE_LAG, COMPLAINT_SURGE
    severity = db.Column(db.String(50), default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    detected_value = db.Column(db.String(100), nullable=True)
    expected_value = db.Column(db.String(100), nullable=True)
    confidence = db.Column(db.Float, default=0.85)
    source = db.Column(db.String(50), default="ISOLATION_FOREST")  # ISOLATION_FOREST, RULE_ENGINE, OPENCV_CCTV
    status = db.Column(db.String(50), default="ACTIVE")  # ACTIVE, INVESTIGATING, RESOLVED, DISMISSED
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    institute = db.relationship("Institute", back_populates="anomalies")

    def to_dict(self):
        return {
            "id": self.id,
            "institute_id": self.institute_id,
            "institute_name": self.institute.name if self.institute else None,
            "anomaly_type": self.anomaly_type,
            "severity": self.severity,
            "title": self.title,
            "description": self.description,
            "detected_value": self.detected_value,
            "expected_value": self.expected_value,
            "confidence": self.confidence,
            "source": self.source,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
