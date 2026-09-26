from datetime import datetime, timezone
from backend.database import db
from backend.models.risk import RiskScore, RiskFactor
from backend.models.institute import Institute
from backend.models.corrective_action import CorrectiveAction
from backend.models.complaint import Complaint
from backend.models.anomaly import Anomaly

class RiskEngine:
    """
    Explainable Risk Engine for INSPECTRA.
    Calculates institute risk score (0-100) based on operational signals.
    Emphasizes Human-in-the-loop decision support (Anomaly Detected != Fraud Proven).
    """

    # Configurable weights
    DEFAULT_WEIGHTS = {
        "attendance_anomaly": 20,
        "compliance_issue": 20,
        "complaints": 15,
        "previous_inspection_issue": 15,
        "reporting_delay": 10,
        "activity_anomaly": 10,
    }

    @staticmethod
    def classify_score(score: int) -> str:
        if score <= 30:
            return "LOW"
        elif score <= 50:
            return "MEDIUM"
        elif score <= 75:
            return "HIGH"
        else:
            return "CRITICAL"

    @classmethod
    def calculate_for_institute(cls, institute: Institute, reason: str = None) -> RiskScore:
        factors = []
        total_score = 0

        # 1. Attendance Anomaly (Max 20 pts)
        # Check deviation between reported and historical attendance
        attendance_dev = abs(institute.reported_attendance - institute.historical_attendance)
        attendance_pts = 0
        status_label = "Normal (Dev < 5%)"
        desc = f"Reported: {institute.reported_attendance}%, Historical: {institute.historical_attendance}%"
        
        if attendance_dev >= 15.0:
            attendance_pts = cls.DEFAULT_WEIGHTS["attendance_anomaly"]
            status_label = f"High Deviation (+{attendance_dev:.1f}%)"
            desc = f"Reported {institute.reported_attendance}% vs historical {institute.historical_attendance}%. Unusual sudden spike detected."
        elif attendance_dev >= 8.0:
            attendance_pts = int(cls.DEFAULT_WEIGHTS["attendance_anomaly"] * 0.6)
            status_label = f"Moderate Deviation (+{attendance_dev:.1f}%)"
            desc = f"Attendance delta of {attendance_dev:.1f}% indicates variation from historical trend."
        
        total_score += attendance_pts
        factors.append({
            "key": "attendance_anomaly",
            "name": "Attendance Deviation",
            "points": attendance_pts,
            "max": cls.DEFAULT_WEIGHTS["attendance_anomaly"],
            "status": status_label,
            "desc": desc,
        })

        # 2. Compliance Issue (Max 20 pts)
        unresolved_cas = CorrectiveAction.query.filter(
            CorrectiveAction.institute_id == institute.id,
            CorrectiveAction.status.in_(["PENDING", "IN_PROGRESS", "OVERDUE", "REJECTED"])
        ).count()
        
        compliance_pts = 0
        if institute.pending_compliance_count > 0 or unresolved_cas > 0:
            compliance_pts = cls.DEFAULT_WEIGHTS["compliance_issue"]
            comp_status = f"{unresolved_cas or institute.pending_compliance_count} Unresolved Item(s)"
            comp_desc = "Previous compliance or corrective action items remain open."
        else:
            comp_status = "All Clear"
            comp_desc = "Mandatory regulatory filings and compliance submissions are up to date."
            
        total_score += compliance_pts
        factors.append({
            "key": "compliance_issue",
            "name": "Regulatory Compliance Status",
            "points": compliance_pts,
            "max": cls.DEFAULT_WEIGHTS["compliance_issue"],
            "status": comp_status,
            "desc": comp_desc,
        })

        # 3. Beneficiary Complaints (Max 15 pts)
        pending_complaints = Complaint.query.filter(
            Complaint.institute_id == institute.id,
            Complaint.status.in_(["PENDING", "INVESTIGATING"])
        ).count()
        
        active_complaints = max(pending_complaints, institute.complaints_count)
        complaint_pts = 0
        if active_complaints >= 3:
            complaint_pts = cls.DEFAULT_WEIGHTS["complaints"]
            comp_lbl = f"{active_complaints} Active Grievances"
            comp_msg = f"{active_complaints} beneficiary complaints received in the current quarter."
        elif active_complaints > 0:
            complaint_pts = int(cls.DEFAULT_WEIGHTS["complaints"] * 0.5)
            comp_lbl = f"{active_complaints} Active Grievance"
            comp_msg = f"{active_complaints} grievance flagged for review."
        else:
            comp_lbl = "No Active Complaints"
            comp_msg = "No beneficiary grievances registered."

        total_score += complaint_pts
        factors.append({
            "key": "complaints",
            "name": "Beneficiary Feedback & Complaints",
            "points": complaint_pts,
            "max": cls.DEFAULT_WEIGHTS["complaints"],
            "status": comp_lbl,
            "desc": comp_msg,
        })

        # 4. Previous Inspection Issues (Max 15 pts)
        inspection_pts = 0
        last_insp = institute.inspections[-1] if institute.inspections else None
        if last_insp and last_insp.final_status in ["NON_COMPLIANT", "PARTIALLY_COMPLIANT"]:
            inspection_pts = cls.DEFAULT_WEIGHTS["previous_inspection_issue"]
            insp_lbl = f"Previous Issue: {last_insp.final_status.replace('_', ' ')}"
            insp_desc = "Deficiencies noted during prior on-site field verification."
        elif institute.pending_compliance_count > 0:
            inspection_pts = int(cls.DEFAULT_WEIGHTS["previous_inspection_issue"] * 0.7)
            insp_lbl = "Historical Non-Compliance"
            insp_desc = "Unresolved findings from earlier monitoring cycles."
        else:
            insp_lbl = "Satisfactory"
            insp_desc = "Prior field inspection concluded with compliant standing."

        total_score += inspection_pts
        factors.append({
            "key": "previous_inspection_issue",
            "name": "Previous Inspection History",
            "points": inspection_pts,
            "max": cls.DEFAULT_WEIGHTS["previous_inspection_issue"],
            "status": insp_lbl,
            "desc": insp_desc,
        })

        # 5. Reporting Delay (Max 10 pts)
        reporting_delay_pts = 0
        if institute.reported_attendance > 90 and unresolved_cas > 0:
            reporting_delay_pts = cls.DEFAULT_WEIGHTS["reporting_delay"]
            rep_lbl = "2 Instances Overdue"
            rep_desc = "Delayed submission of monthly beneficiary utilization and attendance register."
        else:
            rep_lbl = "Timely Submissions"
            rep_desc = "Reports submitted within prescribed statutory timelines."

        total_score += reporting_delay_pts
        factors.append({
            "key": "reporting_delay",
            "name": "Operational Reporting Timeliness",
            "points": reporting_delay_pts,
            "max": cls.DEFAULT_WEIGHTS["reporting_delay"],
            "status": rep_lbl,
            "desc": rep_desc,
        })

        # 6. Activity Anomaly (OpenCV / CCTV / Sensor Signal) (Max 10 pts)
        activity_pts = 0
        active_anomalies = Anomaly.query.filter(
            Anomaly.institute_id == institute.id,
            Anomaly.status == "ACTIVE"
        ).count()

        if active_anomalies > 0 or (institute.reported_attendance > 90 and any(c.unusual_inactivity for c in institute.cctv_cameras)):
            activity_pts = cls.DEFAULT_WEIGHTS["activity_anomaly"]
            act_lbl = "Activity Discrepancy Detected"
            act_desc = "Reported 94%+ occupancy but operational telemetry/CCTV indicates unusually low activity."
        else:
            act_lbl = "Normal Activity Profile"
            act_desc = "Telemetry and on-premise signals conform to expected occupancy profiles."

        total_score += activity_pts
        factors.append({
            "key": "activity_anomaly",
            "name": "Activity & Telemetry Signals",
            "points": activity_pts,
            "max": cls.DEFAULT_WEIGHTS["activity_anomaly"],
            "status": act_lbl,
            "desc": act_desc,
        })

        # Clamp score between 0 and 100
        final_score = min(100, max(0, total_score))
        risk_level = cls.classify_score(final_score)

        if risk_level in ["CRITICAL", "HIGH"]:
            recommendation = "PRIORITY SURPRISE INSPECTION"
        elif risk_level == "MEDIUM":
            recommendation = "TARGETED MONITORING & DOCUMENT AUDIT"
        else:
            recommendation = "ROUTINE PERIODIC MONITORING"

        # Check previous score for diff tracking
        prev_score = institute.latest_risk.score if institute.latest_risk else None

        risk_score_obj = RiskScore(
            institute_id=institute.id,
            score=final_score,
            risk_level=risk_level,
            recommendation=recommendation,
            previous_score=prev_score,
            recalculated_reason=reason or "Periodic operational signal analysis",
            calculated_at=datetime.now(timezone.utc),
        )
        db.session.add(risk_score_obj)
        db.session.flush()

        for f in factors:
            factor_record = RiskFactor(
                risk_score_id=risk_score_obj.id,
                factor_key=f["key"],
                factor_name=f["name"],
                points=f["points"],
                max_points=f["max"],
                status_label=f["status"],
                description=f["desc"],
            )
            db.session.add(factor_record)

        db.session.commit()
        return risk_score_obj
