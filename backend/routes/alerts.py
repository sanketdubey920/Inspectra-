from flask import Blueprint, request
from backend.database import db
from backend.models.anomaly import Anomaly
from backend.models.corrective_action import CorrectiveAction
from backend.models.cctv import CCTVCamera
from backend.models.institute import Institute
from backend.utils.auth import token_required, api_response

alerts_bp = Blueprint("alerts", __name__, url_prefix="/api/alerts")

@alerts_bp.route("", methods=["GET"])
@token_required
def get_alerts():
    category = request.args.get("category")
    severity = request.args.get("severity")

    alerts = []

    # 1. Critical & High risk institute alerts
    high_risk_institutes = Institute.query.all()
    for inst in high_risk_institutes:
        risk = inst.latest_risk
        if risk and risk.score >= 51:
            sev = "CRITICAL" if risk.score >= 76 else "HIGH"
            alerts.append({
                "id": f"risk_{inst.id}",
                "category": "RISK",
                "severity": sev,
                "title": f"High Risk Priority: {inst.name}",
                "description": f"Overall operational risk score is {risk.score}/100 ({risk.risk_level}). Surprise inspection recommended.",
                "institute_id": inst.id,
                "institute_name": inst.name,
                "timestamp": risk.calculated_at.isoformat() if risk.calculated_at else None,
                "link": f"/official/institutes/{inst.id}"
            })

    # 2. CCTV offline alerts
    offline_cameras = CCTVCamera.query.filter_by(status="OFFLINE").all()
    for cam in offline_cameras:
        alerts.append({
            "id": f"cctv_{cam.id}",
            "category": "CCTV",
            "severity": "MEDIUM",
            "title": f"CCTV Feed Offline: {cam.institute.name if cam.institute else 'Institute'}",
            "description": f"Camera '{cam.room}' is currently unreachable. Check NVR network connectivity.",
            "institute_id": cam.institute_id,
            "institute_name": cam.institute.name if cam.institute else None,
            "timestamp": cam.last_ping.isoformat() if cam.last_ping else None,
            "link": f"/official/institutes/{cam.institute_id}"
        })

    # 3. Overdue corrective actions
    overdue_actions = [ca for ca in CorrectiveAction.query.all() if ca.is_overdue]
    for ca in overdue_actions:
        alerts.append({
            "id": f"ca_{ca.id}",
            "category": "COMPLIANCE",
            "severity": "HIGH",
            "title": f"Overdue Corrective Action: {ca.issue_title}",
            "description": f"Deadline of {ca.deadline.isoformat()} has lapsed without verified resolution.",
            "institute_id": ca.institute_id,
            "institute_name": ca.institute.name if ca.institute else None,
            "timestamp": ca.created_at.isoformat() if ca.created_at else None,
            "link": f"/official/actions/{ca.id}"
        })

    if severity:
        alerts = [a for a in alerts if a["severity"] == severity.upper()]
    if category:
        alerts = [a for a in alerts if a["category"] == category.upper()]

    return api_response({
        "alerts": alerts,
        "total": len(alerts),
        "critical_count": sum(1 for a in alerts if a["severity"] == "CRITICAL"),
        "high_count": sum(1 for a in alerts if a["severity"] == "HIGH"),
        "medium_count": sum(1 for a in alerts if a["severity"] == "MEDIUM"),
    })
