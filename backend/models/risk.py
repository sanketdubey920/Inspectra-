from datetime import datetime, timezone
from backend.database import db

class RiskScore(db.Model):
    __tablename__ = "risk_scores"

    id = db.Column(db.Integer, primary_key=True)
    institute_id = db.Column(db.Integer, db.ForeignKey("institutes.id"), nullable=False, index=True)
    score = db.Column(db.Integer, nullable=False)  # 0 to 100
    risk_level = db.Column(db.String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    recommendation = db.Column(db.String(255), nullable=False)  # e.g., "PRIORITY SURPRISE INSPECTION"
    calculated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    recalculated_reason = db.Column(db.String(255), nullable=True)  # e.g., "Corrective Action #12 Verified"
    previous_score = db.Column(db.Integer, nullable=True)

    institute = db.relationship("Institute", back_populates="risk_scores")
    factors = db.relationship("RiskFactor", back_populates="risk_score", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "institute_id": self.institute_id,
            "score": self.score,
            "risk_level": self.risk_level,
            "recommendation": self.recommendation,
            "previous_score": self.previous_score,
            "recalculated_reason": self.recalculated_reason,
            "calculated_at": self.calculated_at.isoformat() if self.calculated_at else None,
            "factors": [f.to_dict() for f in self.factors],
        }

class RiskFactor(db.Model):
    __tablename__ = "risk_factors"

    id = db.Column(db.Integer, primary_key=True)
    risk_score_id = db.Column(db.Integer, db.ForeignKey("risk_scores.id"), nullable=False, index=True)
    factor_key = db.Column(db.String(100), nullable=False)  # attendance_anomaly, compliance_issue, complaints, etc.
    factor_name = db.Column(db.String(150), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    max_points = db.Column(db.Integer, nullable=False)
    status_label = db.Column(db.String(100), nullable=False)  # "High Deviation", "Unresolved", "3 Received"
    description = db.Column(db.String(255), nullable=True)

    risk_score = db.relationship("RiskScore", back_populates="factors")

    def to_dict(self):
        return {
            "id": self.id,
            "factor_key": self.factor_key,
            "factor_name": self.factor_name,
            "points": self.points,
            "max_points": self.max_points,
            "status_label": self.status_label,
            "description": self.description,
        }
