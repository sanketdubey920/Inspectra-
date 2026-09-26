from backend.services.inspection_service import InspectionService
from backend.models.institute import Institute
from backend.models.user import User
from backend.models.inspection import Inspection
from backend.database import db

def test_haversine_distance():
    # Coords close to Bhopal centre (approx 25 meters away)
    lat1, lon1 = 23.2599, 77.4126
    lat2, lon2 = 23.2601, 77.4124
    dist = InspectionService.calculate_haversine_distance(lat1, lon1, lat2, lon2)
    assert dist < 100.0  # Within 100 meters

    # Far point (e.g., Indore, ~170 km away)
    lat_far, lon_far = 22.7196, 75.8577
    dist_far = InspectionService.calculate_haversine_distance(lat1, lon1, lat_far, lon_far)
    assert dist_far > 100000.0  # Over 100km

def test_gps_verification_workflow(app):
    with app.app_context():
        inst = Institute(
            name="GPS Test Centre",
            registration_number="GPS-001",
            address="Bhopal MP",
            state="Madhya Pradesh",
            district="Bhopal",
            latitude=23.2599,
            longitude=77.4126,
            scheme="DDRS",
            institute_type="Special School",
            incharge="Incharge",
            contact="12345",
        )
        inspector = User(
            name="Field Officer",
            email="field@inspectra.demo",
            role="inspection_officer",
            status="ACTIVE"
        )
        inspector.set_password("Pass123")
        db.session.add_all([inst, inspector])
        db.session.commit()

        insp = Inspection(
            institute_id=inst.id,
            inspector_id=inspector.id,
            inspection_type="SURPRISE",
            status="ASSIGNED",
            expected_latitude=inst.latitude,
            expected_longitude=inst.longitude,
        )
        db.session.add(insp)
        db.session.commit()

        # 1. Verification at site (20 meters) -> LOCATION_VERIFIED
        res_near = InspectionService.verify_inspector_gps(insp, 23.2600, 77.4125, allowed_radius_meters=500.0)
        assert res_near["verified"] is True
        assert res_near["status"] == "LOCATION_VERIFIED"
        assert insp.gps_verified is True
        assert insp.status == "IN_PROGRESS"

        # 2. Verification from 10km away -> LOCATION_MISMATCH
        res_far = InspectionService.verify_inspector_gps(insp, 23.3500, 77.5000, allowed_radius_meters=500.0)
        assert res_far["verified"] is False
        assert res_far["status"] == "LOCATION_MISMATCH"
