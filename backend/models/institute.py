from datetime import datetime, timezone
from backend.database import db

class Institute(db.Model):
    __tablename__ = "institutes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False, index=True)
    registration_number = db.Column(db.String(100), unique=True, nullable=False, index=True)
    address = db.Column(db.String(500), nullable=False)
    state = db.Column(db.String(100), nullable=False, index=True)
    district = db.Column(db.String(100), nullable=False, index=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    scheme = db.Column(db.String(200), nullable=False, index=True)  # e.g., Senior Citizen Home, Deendayal Rehabilitation Scheme (DDRS), PM DAKSH
    project = db.Column(db.String(200), nullable=True)
    institute_type = db.Column(db.String(100), nullable=False)  # NGO, Residential School, Rehabilitation Centre, Hostel
    incharge = db.Column(db.String(150), nullable=False)
    contact = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(150), nullable=True)
    capacity = db.Column(db.Integer, default=100)
    current_occupancy = db.Column(db.Integer, default=80)
    status = db.Column(db.String(50), default="ACTIVE")  # ACTIVE, UNDER_INSPECTION, FLAGGED, SUSPENDED

    # Infrastructure indicators (JSON or fields)
    classrooms_count = db.Column(db.Integer, default=4)
    computer_lab = db.Column(db.Boolean, default=True)
    hostel_facility = db.Column(db.Boolean, default=True)
    medical_facility = db.Column(db.Boolean, default=True)
    cctv_enabled = db.Column(db.Boolean, default=True)

    # Operational metrics
    reported_attendance = db.Column(db.Float, default=85.0)
    historical_attendance = db.Column(db.Float, default=80.0)
    pending_compliance_count = db.Column(db.Integer, default=0)
    complaints_count = db.Column(db.Integer, default=0)
    last_inspection_date = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    staff = db.relationship("Staff", back_populates="institute", cascade="all, delete-orphan")
    beneficiaries = db.relationship("Beneficiary", back_populates="institute", cascade="all, delete-orphan")
    attendance_records = db.relationship("Attendance", back_populates="institute", cascade="all, delete-orphan")
    inspections = db.relationship("Inspection", back_populates="institute", cascade="all, delete-orphan")
    risk_scores = db.relationship("RiskScore", back_populates="institute", cascade="all, delete-orphan", order_by="desc(RiskScore.calculated_at)")
    anomalies = db.relationship("Anomaly", back_populates="institute", cascade="all, delete-orphan")
    complaints = db.relationship("Complaint", back_populates="institute", cascade="all, delete-orphan")
    cctv_cameras = db.relationship("CCTVCamera", back_populates="institute", cascade="all, delete-orphan")
    corrective_actions = db.relationship("CorrectiveAction", back_populates="institute", cascade="all, delete-orphan")

    @property
    def latest_risk(self):
        return self.risk_scores[0] if self.risk_scores else None

    def to_dict(self, include_details=False):
        data = {
            "id": self.id,
            "name": self.name,
            "registration_number": self.registration_number,
            "address": self.address,
            "state": self.state,
            "district": self.district,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "scheme": self.scheme,
            "project": self.project,
            "institute_type": self.institute_type,
            "incharge": self.incharge,
            "contact": self.contact,
            "email": self.email,
            "capacity": self.capacity,
            "current_occupancy": self.current_occupancy,
            "status": self.status,
            "classrooms_count": self.classrooms_count,
            "computer_lab": self.computer_lab,
            "hostel_facility": self.hostel_facility,
            "medical_facility": self.medical_facility,
            "cctv_enabled": self.cctv_enabled,
            "reported_attendance": self.reported_attendance,
            "historical_attendance": self.historical_attendance,
            "pending_compliance_count": self.pending_compliance_count,
            "complaints_count": self.complaints_count,
            "last_inspection_date": self.last_inspection_date.isoformat() if self.last_inspection_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if self.latest_risk:
            data["risk"] = self.latest_risk.to_dict()
        else:
            data["risk"] = {
                "score": 25,
                "risk_level": "LOW",
                "recommendation": "Routine monitoring",
                "factors": []
            }

        if include_details:
            data["staff_count"] = len(self.staff)
            data["beneficiaries_count"] = len(self.beneficiaries)
            data["cctv_online_count"] = sum(1 for c in self.cctv_cameras if c.status == "ONLINE")
            data["cctv_total_count"] = len(self.cctv_cameras)
            data["active_corrective_actions"] = sum(1 for ca in self.corrective_actions if ca.status not in ("RESOLVED", "CLOSED"))

        return data
