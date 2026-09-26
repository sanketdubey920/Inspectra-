import math
from datetime import datetime, timezone
from backend.database import db
from backend.models.inspection import Inspection
from backend.models.checklist import InspectionChecklist
from backend.models.institute import Institute

class InspectionService:
    """
    Inspection and Targeted Checklist Service.
    - Generates targeted inspection checklists based on detected operational risks
    - Verifies field location using Haversine formula against institute coordinates
    """

    @staticmethod
    def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great-circle distance between two points on Earth in meters.
        """
        R = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

        distance = R * c
        return round(distance, 2)

    @classmethod
    def verify_inspector_gps(cls, inspection: Inspection, inspector_lat: float, inspector_lon: float, allowed_radius_meters: float = 500.0) -> dict:
        expected_lat = inspection.expected_latitude or inspection.institute.latitude
        expected_lon = inspection.expected_longitude or inspection.institute.longitude

        distance = cls.calculate_haversine_distance(inspector_lat, inspector_lon, expected_lat, expected_lon)
        is_verified = (distance <= allowed_radius_meters)

        inspection.verified_latitude = inspector_lat
        inspection.verified_longitude = inspector_lon
        inspection.gps_distance_meters = distance
        inspection.gps_verified = is_verified
        inspection.gps_verified_at = datetime.now(timezone.utc)
        if inspection.status == "ASSIGNED":
            inspection.status = "IN_PROGRESS"
            inspection.started_at = datetime.now(timezone.utc)

        db.session.commit()

        return {
            "verified": is_verified,
            "status": "LOCATION_VERIFIED" if is_verified else "LOCATION_MISMATCH",
            "distance_meters": distance,
            "allowed_radius_meters": allowed_radius_meters,
            "expected_location": {"latitude": expected_lat, "longitude": expected_lon},
            "inspector_location": {"latitude": inspector_lat, "longitude": inspector_lon},
            "timestamp": inspection.gps_verified_at.isoformat(),
        }

    @classmethod
    def generate_targeted_checklist(cls, inspection: Inspection, risk_factors: list = None) -> list:
        """
        Generates dynamic targeted inspection items based on the specific risk signals of the institute.
        """
        items = []

        # Standard baseline verification
        items.append({
            "section": "General",
            "item_name": "Physical Premise Verification",
            "description": "Confirm signboard, DoSJE scheme display, and active operations at site.",
            "evidence_required": True,
        })

        # Dynamic attendance checks
        has_attendance_anomaly = False
        has_infrastructure_issue = False
        has_complaints = False
        has_compliance_lag = False

        if risk_factors:
            for rf in risk_factors:
                key = rf.get("factor_key") or rf.get("key")
                if key == "attendance_anomaly" and rf.get("points", 0) > 0:
                    has_attendance_anomaly = True
                elif key == "activity_anomaly" and rf.get("points", 0) > 0:
                    has_attendance_anomaly = True
                    has_infrastructure_issue = True
                elif key == "complaints" and rf.get("points", 0) > 0:
                    has_complaints = True
                elif key == "compliance_issue" and rf.get("points", 0) > 0:
                    has_compliance_lag = True

        # If attendance anomaly or high risk, inject targeted attendance checklist
        if has_attendance_anomaly or inspection.trigger_risk_score and inspection.trigger_risk_score > 50:
            items.extend([
                {
                    "section": "Attendance",
                    "item_name": "Physical Attendance Register Audit",
                    "description": "Audit physical daily register vs portal-reported 94% figure. Note discrepancies.",
                    "evidence_required": True,
                },
                {
                    "section": "Attendance",
                    "item_name": "Headcount of Present Beneficiaries",
                    "description": "Conduct on-ground headcount of resident/enrolled beneficiaries currently in facility.",
                    "evidence_required": True,
                },
                {
                    "section": "Attendance",
                    "item_name": "Biometric / Electronic Attendance Device Check",
                    "description": "Verify working status and tamper-seals of attendance machine.",
                    "evidence_required": False,
                }
            ])

        # Staff Verification
        items.extend([
            {
                "section": "Staff",
                "item_name": "On-Duty Staff Roster Verification",
                "description": "Verify physical presence of Project In-charge, Warden, and Caretakers.",
                "evidence_required": True,
            },
            {
                "section": "Staff",
                "item_name": "Staff Qualification & Police Verification Records",
                "description": "Cross-check mandatory documentation for child/senior safety.",
                "evidence_required": False,
            }
        ])

        # Infrastructure Checks
        items.extend([
            {
                "section": "Infrastructure",
                "item_name": "Classroom & Vocational Lab Inspection",
                "description": "Inspect learning materials, seating capacity, and active equipment.",
                "evidence_required": True,
            },
            {
                "section": "Infrastructure",
                "item_name": "Hostel, Kitchen & Sanitation Hygiene Audit",
                "description": "Inspect food quality, clean water facility, and washroom sanitation.",
                "evidence_required": True,
            },
            {
                "section": "Infrastructure",
                "item_name": "First Aid & Medical Station",
                "description": "Verify availability of basic medicines and doctor visit logbook.",
                "evidence_required": False,
            }
        ])

        # Beneficiary Random Interviews
        items.append({
            "section": "Beneficiaries",
            "item_name": "Random Beneficiary Interaction & Welfare Check",
            "description": "Speak with 5 random beneficiaries regarding food, stipend, and overall care.",
            "evidence_required": False,
        })

        # Compliance Checks
        items.append({
            "section": "Compliance",
            "item_name": "Fire Safety NOC & Building Fitness Certificate",
            "description": "Verify renewal dates of valid municipal fire safety and structural fitness certificates.",
            "evidence_required": True,
        })

        created_records = []
        for it in items:
            cl = InspectionChecklist(
                inspection_id=inspection.id,
                section=it["section"],
                item_name=it["item_name"],
                description=it["description"],
                status="PENDING",
                evidence_required=it["evidence_required"],
            )
            db.session.add(cl)
            created_records.append(cl)

        db.session.commit()
        return created_records
