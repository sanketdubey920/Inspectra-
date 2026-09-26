from datetime import date, timedelta, datetime, timezone
from backend.models.institute import Institute
from backend.models.user import User
from backend.models.corrective_action import CorrectiveAction
from backend.models.risk import RiskScore, RiskFactor
from backend.services.risk_engine import RiskEngine
from backend.database import db

def test_corrective_action_and_risk_recalculation(app):
    with app.app_context():
        inst = Institute(
            name="Remediation Academy",
            registration_number="REM-001",
            address="City Centre",
            state="Madhya Pradesh",
            district="Bhopal",
            latitude=23.2599,
            longitude=77.4126,
            scheme="DDRS",
            institute_type="Special School",
            incharge="Headmaster",
            contact="12345",
            reported_attendance=94.0,
            historical_attendance=76.0,
            pending_compliance_count=1,
            complaints_count=3,
        )
        user = User(
            name="Official",
            email="off@demo.com",
            role="department_official",
            status="ACTIVE"
        )
        user.set_password("pass")
        db.session.add_all([inst, user])
        db.session.commit()

        # Compute initial high risk
        initial_risk = RiskEngine.calculate_for_institute(inst, "Initial Evaluation")
        initial_score = initial_risk.score
        assert initial_score >= 51  # High or Critical

        # Create Corrective Action
        ca = CorrectiveAction(
            institute_id=inst.id,
            created_by_id=user.id,
            issue_title="Attendance Mismatch & Roster Rectification",
            description="Submit biometric logs and verified registers within 15 days.",
            severity="HIGH",
            deadline=date.today() + timedelta(days=15),
            status="PENDING",
            created_at=datetime.now(timezone.utc),
        )
        db.session.add(ca)
        db.session.commit()

        # Simulate institute resolution
        ca.resolution_description = "Biometric integration completed. All 76 verified students mapped."
        ca.resolution_evidence_url = "/api/uploads/attendance_audit.pdf"
        ca.status = "SUBMITTED"
        db.session.commit()

        # Simulate Official Verification -> Mark RESOLVED
        ca.status = "RESOLVED"
        ca.verified_by_id = user.id
        ca.verified_at = datetime.now(timezone.utc)
        ca.verification_remarks = "Biometric server logs verified."
        
        # Rectify attendance normalization
        inst.reported_attendance = 76.0
        inst.pending_compliance_count = 0
        inst.complaints_count = 0
        db.session.commit()

        # Recalculate Risk
        recalc_risk = RiskEngine.calculate_for_institute(inst, "Corrective Action Verified")
        recalc_score = recalc_risk.score

        # Verify score dropped significantly (e.g. 82 -> ~20-30, HIGH -> LOW/MEDIUM)
        assert recalc_score < initial_score
        assert recalc_risk.risk_level in ["LOW", "MEDIUM"]
        assert recalc_risk.previous_score == initial_score
