from datetime import datetime, timezone, timedelta, date
from backend.app import create_app
from backend.database import db
from backend.models.user import User
from backend.models.institute import Institute
from backend.models.staff import Staff
from backend.models.beneficiary import Beneficiary
from backend.models.attendance import Attendance
from backend.models.risk import RiskScore, RiskFactor
from backend.models.anomaly import Anomaly
from backend.models.complaint import Complaint
from backend.models.cctv import CCTVCamera
from backend.models.corrective_action import CorrectiveAction
from backend.models.audit_log import AuditLog
from backend.models.notification import Notification
from backend.models.inspection import Inspection
from backend.services.audit_service import AuditService
from backend.services.notification_service import NotificationService
from backend.services.inspection_service import InspectionService

def seed_database():
    app = create_app()
    with app.app_context():
        print("[INSPECTRA] Resetting and seeding database...")
        db.drop_all()
        db.create_all()

        # -------------------------------------------------------------
        # 1. SEED USERS
        # -------------------------------------------------------------
        default_password = "Inspectra@2025"

        official = User(
            name="Dr. Vikramaditya Sharma",
            email="official@inspectra.demo",
            role="department_official",
            phone="+91 98112 34567",
            designation="Director (Monitoring & Evaluation)",
            department="Department of Social Justice and Empowerment (DoSJE)",
            status="ACTIVE"
        )
        official.set_password(default_password)

        inspector = User(
            name="Officer Rajesh Kumar (PMU Team 04)",
            email="inspector@inspectra.demo",
            role="inspection_officer",
            phone="+91 94250 88776",
            designation="Lead PMU Field Inspector",
            department="DoSJE State PMU Cell - Central Zone",
            status="ACTIVE"
        )
        inspector.set_password(default_password)

        institute_user = User(
            name="Dr. Rajesh Verma",
            email="institute@inspectra.demo",
            role="institute_representative",
            phone="+91 97551 12233",
            designation="Project In-charge",
            department="ABC Residential Centre",
            status="ACTIVE",
            institute_id=1  # Will link to ABC Residential Centre
        )
        institute_user.set_password(default_password)

        beneficiary_user = User(
            name="Rameshwar Patel",
            email="beneficiary@inspectra.demo",
            role="beneficiary",
            phone="+91 91112 77889",
            designation="Beneficiary Guardian / Citizen",
            department="Citizen Monitoring Network",
            status="ACTIVE"
        )
        beneficiary_user.set_password(default_password)

        db.session.add_all([official, inspector, institute_user, beneficiary_user])
        db.session.commit()

        # -------------------------------------------------------------
        # 2. SEED INSTITUTES
        # -------------------------------------------------------------
        # Spotlight demo institute: ABC Residential Centre — Bhopal
        bhopal_inst = Institute(
            id=1,
            name="ABC Residential Centre — Bhopal",
            registration_number="DOSJE-MP-BHP-2018-0042",
            address="Plot 14, Sector B, MP Nagar Zone-1, Near Chetak Bridge, Bhopal",
            state="Madhya Pradesh",
            district="Bhopal",
            latitude=23.2599,
            longitude=77.4126,
            scheme="Deendayal Rehabilitation Scheme (DDRS)",
            project="Residential Special School & Skill Training for Children with Intellectual Disabilities",
            institute_type="Residential Special School & Skill Centre",
            incharge="Dr. Rajesh Verma",
            contact="+91 755 2445890",
            email="bhopal.centre@abcwelfare.org.in",
            capacity=120,
            current_occupancy=95,
            status="FLAGGED",
            classrooms_count=6,
            computer_lab=True,
            hostel_facility=True,
            medical_facility=True,
            cctv_enabled=True,
            reported_attendance=94.0,
            historical_attendance=76.0,
            pending_compliance_count=1,
            complaints_count=3,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=120)
        )

        indore_inst = Institute(
            id=2,
            name="Malwa Rehabilitation & Training Centre — Indore",
            registration_number="DOSJE-MP-IND-2020-0088",
            address="22 Scheme 54, Vijay Nagar, Indore",
            state="Madhya Pradesh",
            district="Indore",
            latitude=22.7196,
            longitude=75.8577,
            scheme="PM DAKSH Scheme",
            project="Skill Development and Vocational Empowerment Institute",
            institute_type="Vocational Training Institute",
            incharge="Smt. Anita Chouhan",
            contact="+91 731 2894112",
            email="info@malwarehab.org",
            capacity=150,
            current_occupancy=130,
            status="ACTIVE",
            classrooms_count=8,
            computer_lab=True,
            hostel_facility=False,
            medical_facility=True,
            cctv_enabled=True,
            reported_attendance=82.0,
            historical_attendance=80.0,
            pending_compliance_count=0,
            complaints_count=0,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=45)
        )

        delhi_inst = Institute(
            id=3,
            name="National Senior Care & Assisted Living — New Delhi",
            registration_number="DOSJE-DL-ND-2016-0012",
            address="Institutional Area, Sector 4, R.K. Puram, New Delhi",
            state="Delhi",
            district="New Delhi",
            latitude=28.6139,
            longitude=77.2090,
            scheme="Integrated Programme for Senior Citizens (IPSrC)",
            project="Assisted Care and Physiotherapy Centre for Indigent Elderly",
            institute_type="Hostel & Geriatric Home",
            incharge="Col. K.S. Rathore (Retd.)",
            contact="+91 11 26178901",
            email="delhi.care@nationalsocial.org",
            capacity=80,
            current_occupancy=72,
            status="ACTIVE",
            classrooms_count=2,
            computer_lab=False,
            hostel_facility=True,
            medical_facility=True,
            cctv_enabled=True,
            reported_attendance=88.0,
            historical_attendance=84.0,
            pending_compliance_count=1,
            complaints_count=1,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=60)
        )

        jaipur_inst = Institute(
            id=4,
            name="Prerna Special Children Academy — Jaipur",
            registration_number="DOSJE-RJ-JPR-2019-0104",
            address="Near Vidyadhar Nagar Stadium, Sector 3, Jaipur",
            state="Rajasthan",
            district="Jaipur",
            latitude=26.9124,
            longitude=75.7873,
            scheme="Deendayal Rehabilitation Scheme (DDRS)",
            project="Day Care Special School & Therapy Centre for Cerebral Palsy",
            institute_type="Special School",
            incharge="Mrs. Meenakshi Sharma",
            contact="+91 141 2339900",
            email="prerna.jaipur@gmail.com",
            capacity=60,
            current_occupancy=55,
            status="ACTIVE",
            classrooms_count=4,
            computer_lab=True,
            hostel_facility=False,
            medical_facility=True,
            cctv_enabled=True,
            reported_attendance=79.0,
            historical_attendance=81.0,
            pending_compliance_count=0,
            complaints_count=0,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=30)
        )

        pune_inst = Institute(
            id=5,
            name="Sahyadri Community Development Trust — Pune",
            registration_number="DOSJE-MH-PUN-2017-0056",
            address="Plot 88, Pimpri Chinchwad Industrial Area, Pune",
            state="Maharashtra",
            district="Pune",
            latitude=18.5204,
            longitude=73.8567,
            scheme="Assistance to Voluntary Organisations working for Scheduled Castes",
            project="Vocational Skill Training & Residential Hostel",
            institute_type="Rehabilitation Centre",
            incharge="Shri Dilip Gaikwad",
            contact="+91 20 27451290",
            email="director@sahyadritrust.org",
            capacity=110,
            current_occupancy=102,
            status="FLAGGED",
            classrooms_count=5,
            computer_lab=True,
            hostel_facility=True,
            medical_facility=False,
            cctv_enabled=True,
            reported_attendance=91.0,
            historical_attendance=75.0,
            pending_compliance_count=2,
            complaints_count=2,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=150)
        )

        lucknow_inst = Institute(
            id=6,
            name="Awadh Social Welfare Foundation — Lucknow",
            registration_number="DOSJE-UP-LKO-2015-0019",
            address="Kisan Bazar Road, Vibhuti Khand, Gomti Nagar, Lucknow",
            state="Uttar Pradesh",
            district="Lucknow",
            latitude=26.8467,
            longitude=80.9462,
            scheme="Integrated Programme for Senior Citizens (IPSrC)",
            project="Old Age Home and Mobile Medicare Unit",
            institute_type="Old Age Home",
            incharge="Dr. Alok Srivastava",
            contact="+91 522 2728901",
            email="awadh.welfare@lucknow.org",
            capacity=90,
            current_occupancy=88,
            status="FLAGGED",
            classrooms_count=2,
            computer_lab=False,
            hostel_facility=True,
            medical_facility=True,
            cctv_enabled=False,
            reported_attendance=96.0,
            historical_attendance=71.0,
            pending_compliance_count=3,
            complaints_count=5,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=180)
        )

        mumbai_inst = Institute(
            id=7,
            name="Mumbai Ability & Assistive Living Centre — Chembur",
            registration_number="DOSJE-MH-MUM-2021-0133",
            address="CTS 412, Sion-Trombay Road, Chembur, Mumbai",
            state="Maharashtra",
            district="Mumbai",
            latitude=19.0760,
            longitude=72.8777,
            scheme="Deendayal Rehabilitation Scheme (DDRS)",
            project="Skill Development & Inclusive Employment Hub",
            institute_type="Vocational Training Institute",
            incharge="Ms. Farah Merchant",
            contact="+91 22 25287700",
            email="chembur.hub@mumbaiability.org",
            capacity=140,
            current_occupancy=115,
            status="ACTIVE",
            classrooms_count=6,
            computer_lab=True,
            hostel_facility=False,
            medical_facility=True,
            cctv_enabled=True,
            reported_attendance=83.0,
            historical_attendance=81.0,
            pending_compliance_count=1,
            complaints_count=1,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=40)
        )

        bengaluru_inst = Institute(
            id=8,
            name="Karnataka Samvedna Trust — Bengaluru",
            registration_number="DOSJE-KA-BLR-2020-0077",
            address="14th Cross, 2nd Stage, Indiranagar, Bengaluru",
            state="Karnataka",
            district="Bengaluru",
            latitude=12.9716,
            longitude=77.5946,
            scheme="PM DAKSH Scheme",
            project="Advanced IT & Hardware Empowerment for PwDs",
            institute_type="Residential School",
            incharge="Dr. H.R. Chandrashekar",
            contact="+91 80 25204433",
            email="samvedna@karnatakasocial.in",
            capacity=100,
            current_occupancy=90,
            status="ACTIVE",
            classrooms_count=5,
            computer_lab=True,
            hostel_facility=True,
            medical_facility=True,
            cctv_enabled=True,
            reported_attendance=86.0,
            historical_attendance=85.0,
            pending_compliance_count=0,
            complaints_count=0,
            last_inspection_date=datetime.now(timezone.utc) - timedelta(days=25)
        )

        db.session.add_all([
            bhopal_inst, indore_inst, delhi_inst, jaipur_inst,
            pune_inst, lucknow_inst, mumbai_inst, bengaluru_inst
        ])
        db.session.commit()

        # Update institute user with institute_id
        institute_user.institute_id = bhopal_inst.id
        db.session.commit()

        # -------------------------------------------------------------
        # 3. SEED STAFF FOR BHOPAL INSTITUTE
        # -------------------------------------------------------------
        staff_members = [
            Staff(institute_id=bhopal_inst.id, name="Dr. Rajesh Verma", designation="Project In-charge", qualification="Ph.D. Social Work", phone="+91 97551 12233", status="PRESENT"),
            Staff(institute_id=bhopal_inst.id, name="Mrs. Sunita Saxena", designation="Chief Hostel Warden", qualification="M.A. Psychology", phone="+91 94255 33441", status="PRESENT"),
            Staff(institute_id=bhopal_inst.id, name="Shri Manoj Tiwari", designation="Senior Special Educator", qualification="B.Ed. Special Education", phone="+91 98930 11223", status="PRESENT"),
            Staff(institute_id=bhopal_inst.id, name="Kumari Deepa Ahirwar", designation="Vocational Trainer", qualification="Diploma Computer Applications", phone="+91 91114 55667", status="ON_LEAVE"),
            Staff(institute_id=bhopal_inst.id, name="Dr. Anand Deshmukh", designation="Visiting Medical Officer", qualification="MBBS", phone="+91 94244 77889", status="PRESENT"),
            Staff(institute_id=bhopal_inst.id, name="Shri Ram Prasad", designation="Caretaker & Security In-charge", qualification="Higher Secondary", phone="+91 93001 22334", status="PRESENT"),
        ]
        db.session.add_all(staff_members)

        # -------------------------------------------------------------
        # 4. SEED BENEFICIARIES FOR BHOPAL INSTITUTE
        # -------------------------------------------------------------
        beneficiaries_sample = [
            Beneficiary(institute_id=bhopal_inst.id, beneficiary_code="BEN-BHP-001", name="Aarav Mehra", gender="Male", age=14, category="PwD", attendance_rate=95.0, status="ACTIVE"),
            Beneficiary(institute_id=bhopal_inst.id, beneficiary_code="BEN-BHP-002", name="Pooja Ahirwar", gender="Female", age=16, category="SC", attendance_rate=92.0, status="ACTIVE"),
            Beneficiary(institute_id=bhopal_inst.id, beneficiary_code="BEN-BHP-003", name="Rohan Yadav", gender="Male", age=15, category="OBC", attendance_rate=90.0, status="ACTIVE"),
            Beneficiary(institute_id=bhopal_inst.id, beneficiary_code="BEN-BHP-004", name="Priyanka Sen", gender="Female", age=17, category="PwD", attendance_rate=94.0, status="ACTIVE"),
            Beneficiary(institute_id=bhopal_inst.id, beneficiary_code="BEN-BHP-005", name="Vikram Markam", gender="Male", age=13, category="ST", attendance_rate=88.0, status="ACTIVE"),
        ]
        db.session.add_all(beneficiaries_sample)

        # -------------------------------------------------------------
        # 5. SEED ATTENDANCE LOGS
        # -------------------------------------------------------------
        today = date.today()
        for i in range(10):
            d = today - timedelta(days=i)
            # High reported rate causing anomaly
            att = Attendance(
                institute_id=bhopal_inst.id,
                record_date=d,
                total_enrolled=95,
                present_count=89 if i % 2 == 0 else 90,
                reported_rate=94.0,
                verified_rate=68.0 if i == 0 else None,
                notes="Daily biometric & register check"
            )
            db.session.add(att)

        # -------------------------------------------------------------
        # 6. SEED CCTV CAMERAS FOR BHOPAL INSTITUTE
        # -------------------------------------------------------------
        cctv_cams = [
            CCTVCamera(institute_id=bhopal_inst.id, camera_name="CAM-01", room="Reception", status="ONLINE", activity_level=80.0, occupancy_count=4, unusual_inactivity=False),
            CCTVCamera(institute_id=bhopal_inst.id, camera_name="CAM-02", room="Office", status="ONLINE", activity_level=65.0, occupancy_count=3, unusual_inactivity=False),
            CCTVCamera(institute_id=bhopal_inst.id, camera_name="CAM-03", room="Classroom 1", status="ONLINE", activity_level=75.0, occupancy_count=18, unusual_inactivity=False),
            CCTVCamera(institute_id=bhopal_inst.id, camera_name="CAM-04", room="Classroom 2", status="ONLINE", activity_level=20.0, occupancy_count=2, unusual_inactivity=True),  # Activity anomaly
            CCTVCamera(institute_id=bhopal_inst.id, camera_name="CAM-05", room="Computer Lab", status="ONLINE", activity_level=70.0, occupancy_count=12, unusual_inactivity=False),
            CCTVCamera(institute_id=bhopal_inst.id, camera_name="CAM-06", room="Hostel", status="ONLINE", activity_level=60.0, occupancy_count=22, unusual_inactivity=False),
        ]
        db.session.add_all(cctv_cams)

        # -------------------------------------------------------------
        # 7. SEED ANOMALIES FOR BHOPAL INSTITUTE
        # -------------------------------------------------------------
        anom1 = Anomaly(
            institute_id=bhopal_inst.id,
            anomaly_type="ATTENDANCE_SPIKE",
            severity="HIGH",
            title="Statistical Attendance Spike Detected",
            description="Reported daily attendance is 94.0% against verified historical 3-month baseline of 76.0% (+18.0% delta).",
            detected_value="94.0%",
            expected_value="76.0%",
            confidence=0.92,
            source="ISOLATION_FOREST",
            status="ACTIVE"
        )
        anom2 = Anomaly(
            institute_id=bhopal_inst.id,
            anomaly_type="ACTIVITY_DISCREPANCY",
            severity="HIGH",
            title="CCTV Activity vs Attendance Discrepancy",
            description="Classroom 2 operational telemetry indicates 20% activity level and 2 persons present during peak morning hours while 25 beneficiaries were logged.",
            detected_value="20% activity",
            expected_value="75% activity",
            confidence=0.88,
            source="OPENCV_CCTV",
            status="ACTIVE"
        )
        db.session.add_all([anom1, anom2])

        # -------------------------------------------------------------
        # 8. SEED COMPLAINTS FOR BHOPAL INSTITUTE (3 Active Grievances)
        # -------------------------------------------------------------
        comp1 = Complaint(
            institute_id=bhopal_inst.id,
            tracking_code="GRV-202509-88129A",
            category="Facility Hygiene & Food Quality",
            description="Nutritional standards in evening meal repeatedly deficient; drinking water dispenser filter not serviced for 4 months.",
            severity="HIGH",
            is_anonymous=False,
            complainant_name="Sunil Kumar (Guardian)",
            complainant_contact="+91 94250 11998",
            status="PENDING"
        )
        comp2 = Complaint(
            institute_id=bhopal_inst.id,
            tracking_code="GRV-202509-77214B",
            category="Staff Absenteeism",
            description="Night duty warden frequently unavailable during emergency medical assistance requests.",
            severity="MEDIUM",
            is_anonymous=True,
            status="PENDING"
        )
        comp3 = Complaint(
            institute_id=bhopal_inst.id,
            tracking_code="GRV-202509-66102C",
            category="Allowance / Material Distribution Delay",
            description="Quarterly vocational stationery kits have not been distributed to enrolled students for July cycle.",
            severity="MEDIUM",
            is_anonymous=False,
            complainant_name="Mahesh Ahirwar",
            complainant_contact="+91 98931 44556",
            status="PENDING"
        )
        comp4 = Complaint(
            institute_id=bhopal_inst.id,
            tracking_code="GRV-202508-44910D",
            category="Medical Assistance Shortage",
            description="Periodic medical check-up physician has not visited the residential facility for 6 weeks.",
            severity="HIGH",
            is_anonymous=False,
            complainant_name="Radha Bai (Mother)",
            complainant_contact="+91 97521 88342",
            status="ACTION_INITIATED",
            resolution_notes="Show Cause Notice issued to In-Charge on 28 Aug 2026. Empanelled medical doctor appointed for weekly visits with biometric muster verification.",
            created_at=datetime(2026, 8, 20, 10, 15, tzinfo=timezone.utc)
        )
        comp5 = Complaint(
            institute_id=bhopal_inst.id,
            tracking_code="GRV-202507-11883E",
            category="Facility Hygiene & Food Quality",
            description="Dining hall ceiling leak during heavy monsoon rainfall and unhygienic drinking water filter dispenser.",
            severity="MEDIUM",
            is_anonymous=True,
            status="RESOLVED",
            resolution_notes="Infrastructure repairs completed on 15 Aug 2026. New stainless steel RO water purification unit installed and verified by PMU inspection squad.",
            created_at=datetime(2026, 7, 12, 14, 0, tzinfo=timezone.utc),
            resolved_at=datetime(2026, 8, 15, 16, 30, tzinfo=timezone.utc)
        )
        db.session.add_all([comp1, comp2, comp3, comp4, comp5])

        # -------------------------------------------------------------
        # 9. SEED RISK SCORES & FACTORS
        # -------------------------------------------------------------
        # Bhopal Institute -> Exactly 82/100 HIGH Risk
        bhopal_risk = RiskScore(
            institute_id=bhopal_inst.id,
            score=82,
            risk_level="HIGH",
            recommendation="PRIORITY SURPRISE INSPECTION",
            calculated_at=datetime.now(timezone.utc) - timedelta(hours=2),
            recalculated_reason="Continuous operational multi-signal evaluation",
        )
        db.session.add(bhopal_risk)
        db.session.flush()

        # Exactly matches the required 82 explainable breakdown:
        # Attendance anomaly: 20
        # Compliance issue: 18
        # Complaints: 15
        # Previous inspection issue: 12
        # Reporting delay: 9
        # Activity anomaly: 8
        # Total = 82 / 100
        bhopal_factors = [
            RiskFactor(
                risk_score_id=bhopal_risk.id,
                factor_key="attendance_anomaly",
                factor_name="Attendance Deviation",
                points=20,
                max_points=20,
                status_label="High Deviation (+18.0%)",
                description="Reported 94% attendance vs historical baseline of 76%."
            ),
            RiskFactor(
                risk_score_id=bhopal_risk.id,
                factor_key="compliance_issue",
                factor_name="Regulatory Compliance Status",
                points=18,
                max_points=20,
                status_label="Unresolved Compliance",
                description="Annual building fitness and Fire NOC renewal documentation pending."
            ),
            RiskFactor(
                risk_score_id=bhopal_risk.id,
                factor_key="complaints",
                factor_name="Beneficiary Feedback & Complaints",
                points=15,
                max_points=15,
                status_label="3 Active Grievances",
                description="Food quality and night staff absenteeism complaints received in current quarter."
            ),
            RiskFactor(
                risk_score_id=bhopal_risk.id,
                factor_key="previous_inspection_issue",
                factor_name="Previous Inspection History",
                points=12,
                max_points=15,
                status_label="Prior Deficiency Recorded",
                description="Previous inspection noted classroom sanitation and register maintenance lapses."
            ),
            RiskFactor(
                risk_score_id=bhopal_risk.id,
                factor_key="reporting_delay",
                factor_name="Operational Reporting Timeliness",
                points=9,
                max_points=10,
                status_label="2 Overdue Submissions",
                description="Quarterly utilization certificates delayed beyond statutory filing grace period."
            ),
            RiskFactor(
                risk_score_id=bhopal_risk.id,
                factor_key="activity_anomaly",
                factor_name="Activity & Telemetry Signals",
                points=8,
                max_points=10,
                status_label="Activity Anomaly Detected",
                description="OpenCV telemetry indicates low occupancy in Classroom 2 during scheduled sessions."
            ),
        ]
        db.session.add_all(bhopal_factors)

        # Seed scores for other institutes
        other_scores = [
            (indore_inst.id, 22, "LOW", "ROUTINE PERIODIC MONITORING"),
            (delhi_inst.id, 44, "MEDIUM", "TARGETED MONITORING & DOCUMENT AUDIT"),
            (jaipur_inst.id, 18, "LOW", "ROUTINE PERIODIC MONITORING"),
            (pune_inst.id, 68, "HIGH", "PRIORITY SURPRISE INSPECTION"),
            (lucknow_inst.id, 88, "CRITICAL", "PRIORITY SURPRISE INSPECTION"),
            (mumbai_inst.id, 38, "MEDIUM", "TARGETED MONITORING & DOCUMENT AUDIT"),
            (bengaluru_inst.id, 15, "LOW", "ROUTINE PERIODIC MONITORING"),
        ]
        for inst_id, sc, lvl, rec in other_scores:
            rs = RiskScore(
                institute_id=inst_id,
                score=sc,
                risk_level=lvl,
                recommendation=rec,
                calculated_at=datetime.now(timezone.utc) - timedelta(hours=6),
            )
            db.session.add(rs)

        # -------------------------------------------------------------
        # 10. INITIAL AUDIT LOGS & NOTIFICATIONS
        # -------------------------------------------------------------
        AuditService.log(
            action="SYSTEM_INIT",
            user_name="System",
            role="System",
            entity_type="Platform",
            details="INSPECTRA database initialized with official DoSJE seed records."
        )

        AuditService.log(
            action="RISK_CALCULATED",
            user_name="Risk Engine AI",
            role="AI_SERVICE",
            entity_type="Institute",
            entity_id=bhopal_inst.id,
            details="Calculated High Risk (82/100) for ABC Residential Centre — Bhopal. Recommendation: PRIORITY SURPRISE INSPECTION."
        )

        NotificationService.send(
            user_id=official.id,
            title="High Risk Institute Flagged: ABC Residential Centre",
            message="Risk Engine calculated 82/100 risk score based on attendance deviation and active grievances. Surprise inspection recommended.",
            notification_type="HIGH_RISK",
            link=f"/official/institutes/{bhopal_inst.id}"
        )

        # -------------------------------------------------------------
        # 11. SEED ASSIGNED FIELD INSPECTIONS
        # -------------------------------------------------------------
        insp_bhopal = Inspection(
            institute_id=bhopal_inst.id,
            inspector_id=inspector.id,
            inspection_type="SURPRISE",
            priority="HIGH",
            status="ASSIGNED",
            trigger_risk_score=82,
            trigger_risk_level="HIGH",
            trigger_reasons="Attendance Deviation (+18.0%), Unresolved Fire Safety NOC, 3 Active Grievances",
            special_instructions="Conduct unannounced on-ground inspection. Cross-examine physical attendance register vs reported 94% figure. Conduct random headcount and inspect classroom 2 facilities.",
            expected_latitude=bhopal_inst.latitude,
            expected_longitude=bhopal_inst.longitude,
            scheduled_date=datetime.now(timezone.utc),
        )
        db.session.add(insp_bhopal)

        insp_lucknow = Inspection(
            institute_id=lucknow_inst.id,
            inspector_id=inspector.id,
            inspection_type="SURPRISE",
            priority="CRITICAL",
            status="ASSIGNED",
            trigger_risk_score=88,
            trigger_risk_level="CRITICAL",
            trigger_reasons="Severe Attendance Drop (-26.0%), Overdue Statutory Audit, Multiple Whistleblower Grievances",
            special_instructions="Priority surprise audit ordered by Joint Secretary. Inspect kitchen nutrition registers and audit night duty muster.",
            expected_latitude=lucknow_inst.latitude,
            expected_longitude=lucknow_inst.longitude,
            scheduled_date=datetime.now(timezone.utc) + timedelta(days=1),
        )
        db.session.add(insp_lucknow)
        db.session.commit()

        # Generate targeted checklists for both
        bhopal_risk_factors = [f.to_dict() for f in bhopal_risk.factors] if bhopal_risk else []
        InspectionService.generate_targeted_checklist(insp_bhopal, bhopal_risk_factors)
        InspectionService.generate_targeted_checklist(insp_lucknow, [])

        NotificationService.send(
            user_id=inspector.id,
            title="High Risk Surprise Inspection Assigned",
            message=f"You have been assigned for a surprise inspection at {bhopal_inst.name}.",
            notification_type="INSPECTION_ASSIGNED",
            link=f"/inspector/inspections/{insp_bhopal.id}"
        )

        db.session.commit()
        print("[INSPECTRA] Seed data generation finished successfully!")

if __name__ == "__main__":
    seed_database()
