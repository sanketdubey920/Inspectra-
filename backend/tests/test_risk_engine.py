import pytest
from backend.services.risk_engine import RiskEngine
from backend.models.institute import Institute
from backend.models.corrective_action import CorrectiveAction
from backend.database import db

def test_risk_classification():
    assert RiskEngine.classify_score(25) == "LOW"
    assert RiskEngine.classify_score(45) == "MEDIUM"
    assert RiskEngine.classify_score(65) == "HIGH"
    assert RiskEngine.classify_score(82) == "CRITICAL" or RiskEngine.classify_score(82) == "CRITICAL"
    assert RiskEngine.classify_score(82) == "CRITICAL"

def test_risk_calculation_for_institute(app):
    with app.app_context():
        inst = Institute(
            name="Test Institute",
            registration_number="TEST-REG-001",
            address="Test Address",
            state="Madhya Pradesh",
            district="Bhopal",
            latitude=23.2599,
            longitude=77.4126,
            scheme="DDRS",
            institute_type="Special School",
            incharge="Test Incharge",
            contact="+91 99999 00000",
            reported_attendance=95.0,
            historical_attendance=75.0,  # 20% deviation
            pending_compliance_count=1,
            complaints_count=3,
        )
        db.session.add(inst)
        db.session.commit()

        risk = RiskEngine.calculate_for_institute(inst, "Initial test calculation")
        assert risk is not None
        assert risk.score >= 51  # High or Critical
        assert len(risk.factors) == 6
        assert any(f.factor_key == "attendance_anomaly" and f.points > 0 for f in risk.factors)
