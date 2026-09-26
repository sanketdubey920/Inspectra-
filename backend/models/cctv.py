from datetime import datetime, timezone
from backend.database import db

class CCTVCamera(db.Model):
    __tablename__ = "cctv_cameras"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    camera_name = db.Column(db.String(150), nullable=False)
    room = db.Column(db.String(100), nullable=False)  # Classroom 1, Classroom 2, Office, Computer Lab, Hostel, Reception
    status = db.Column(db.String(50), default="ONLINE")  # ONLINE, OFFLINE, MAINTENANCE
    stream_type = db.Column(db.String(50), default="SIMULATED")  # SIMULATED, RTSP, ONVIF, HLS
    stream_reference = db.Column(db.String(500), nullable=True)  # URL or simulated feed identifier
    
    # Computer Vision / OpenCV extracted operational telemetry
    activity_level = db.Column(db.Float, default=72.0)  # Percentage activity detected
    occupancy_count = db.Column(db.Integer, default=18)  # Estimated person count
    unusual_inactivity = db.Column(db.Boolean, default=False)
    last_ping = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    institute = db.relationship("Institute", back_populates="cctv_cameras")

    def to_dict(self):
        return {
            "id": self.id,
            "institute_id": self.institute_id,
            "camera_name": self.camera_name,
            "room": self.room,
            "status": self.status,
            "stream_type": self.stream_type,
            "stream_reference": self.stream_reference,
            "activity_level": self.activity_level,
            "occupancy_count": self.occupancy_count,
            "unusual_inactivity": self.unusual_inactivity,
            "last_ping": self.last_ping.isoformat() if self.last_ping else None,
        }
