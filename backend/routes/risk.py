from flask import Blueprint, request
from backend.database import db
from backend.models.institute import Institute
from backend.models.risk import RiskScore
from backend.models.anomaly import Anomaly
from backend.services.risk_engine import RiskEngine
from backend.services.anomaly_detection import AnomalyDetector
from backend.utils.auth import token_required, api_response, api_error

risk_bp = Blueprint("risk", __name__, url_prefix="/api/risk")

@risk_bp.route("/summary", methods=["GET"])
def get_risk_summary():
    institutes = Institute.query.all()
    
    total = len(institutes)
    level_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    state_breakdown = {}

    for inst in institutes:
        risk = inst.latest_risk
        level = risk.risk_level if risk else "LOW"
        level_counts[level] = level_counts.get(level, 0) + 1

        state = inst.state
        if state not in state_breakdown:
            state_breakdown[state] = {"total": 0, "high_critical": 0}
        state_breakdown[state]["total"] += 1
        if level in ["HIGH", "CRITICAL"]:
            state_breakdown[state]["high_critical"] += 1

    return api_response({
        "total_institutes": total,
        "active_institutes": sum(1 for i in institutes if i.status == "ACTIVE"),
        "high_risk_count": level_counts.get("HIGH", 0),
        "critical_risk_count": level_counts.get("CRITICAL", 0),
        "medium_risk_count": level_counts.get("MEDIUM", 0),
        "low_risk_count": level_counts.get("LOW", 0),
        "distribution": [
            {"name": "Low Risk (0-30)", "count": level_counts["LOW"], "color": "#10B981"},
            {"name": "Medium Risk (31-50)", "count": level_counts["MEDIUM"], "color": "#F59E0B"},
            {"name": "High Risk (51-75)", "count": level_counts["HIGH"], "color": "#F97316"},
            {"name": "Critical Risk (76-100)", "count": level_counts["CRITICAL"], "color": "#EF4444"},
        ],
        "state_breakdown": state_breakdown,
    })

@risk_bp.route("/anomalies", methods=["GET"])
def get_anomalies():
    inst_id = request.args.get("institute_id")
    query = Anomaly.query
    if inst_id:
        query = query.filter(Anomaly.institute_id == int(inst_id))
    
    anomalies = query.order_by(Anomaly.created_at.desc()).all()
    return api_response({
        "anomalies": [a.to_dict() for a in anomalies],
        "total": len(anomalies)
    })

@risk_bp.route("/recalculate/<int:institute_id>", methods=["POST"])
@token_required
def force_recalculate(institute_id: int):
    institute = Institute.query.get(institute_id)
    if not institute:
        return api_error("Institute not found.", "NOT_FOUND", 404)

    risk_score = RiskEngine.calculate_for_institute(institute, "Manual on-demand recalculation")
    return api_response(risk_score.to_dict(), "Risk recalculation complete.")
