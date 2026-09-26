from flask import Blueprint, request, g
from backend.database import db
from backend.models.institute import Institute
from backend.models.risk import RiskScore
from backend.utils.auth import token_required, roles_required, api_response, api_error

institutes_bp = Blueprint("institutes", __name__, url_prefix="/api/institutes")

@institutes_bp.route("", methods=["GET"])
def get_institutes():
    query = Institute.query

    state = request.args.get("state")
    district = request.args.get("district")
    scheme = request.args.get("scheme")
    inst_type = request.args.get("type")
    risk_level = request.args.get("risk_level")
    search = request.args.get("search")

    if state:
        query = query.filter(Institute.state.ilike(f"%{state}%"))
    if district:
        query = query.filter(Institute.district.ilike(f"%{district}%"))
    if scheme:
        query = query.filter(Institute.scheme.ilike(f"%{scheme}%"))
    if inst_type:
        query = query.filter(Institute.institute_type.ilike(f"%{inst_type}%"))
    if search:
        query = query.filter(
            (Institute.name.ilike(f"%{search}%")) |
            (Institute.registration_number.ilike(f"%{search}%")) |
            (Institute.district.ilike(f"%{search}%"))
        )

    institutes = query.all()
    results = [inst.to_dict() for inst in institutes]

    # If risk_level filter is requested
    if risk_level:
        risk_level = risk_level.upper()
        results = [i for i in results if i.get("risk", {}).get("risk_level") == risk_level]

    return api_response({"institutes": results, "total": len(results)})

@institutes_bp.route("/<int:institute_id>", methods=["GET"])
def get_institute_detail(institute_id: int):
    institute = Institute.query.get(institute_id)
    if not institute:
        return api_error("Institute not found.", "NOT_FOUND", 404)

    data = institute.to_dict(include_details=True)
    data["staff"] = [s.to_dict() for s in institute.staff]
    data["beneficiaries"] = [b.to_dict() for b in institute.beneficiaries]
    data["attendance_history"] = [a.to_dict() for a in institute.attendance_records]
    data["cctv_cameras"] = [c.to_dict() for c in institute.cctv_cameras]
    data["anomalies"] = [an.to_dict() for an in institute.anomalies]
    data["complaints"] = [cm.to_dict() for cm in institute.complaints]
    data["inspections"] = [insp.to_dict() for insp in institute.inspections]
    data["corrective_actions"] = [ca.to_dict() for ca in institute.corrective_actions]
    data["risk_history"] = [rs.to_dict() for rs in institute.risk_scores[:5]]

    return api_response(data)

@institutes_bp.route("/<int:institute_id>/risk", methods=["GET"])
def get_institute_risk(institute_id: int):
    institute = Institute.query.get(institute_id)
    if not institute:
        return api_error("Institute not found.", "NOT_FOUND", 404)

    risk = institute.latest_risk
    if not risk:
        return api_response({
            "score": 25,
            "risk_level": "LOW",
            "recommendation": "Routine monitoring",
            "factors": []
        })

    return api_response(risk.to_dict())

@institutes_bp.route("/<int:institute_id>/cctv", methods=["GET"])
def get_institute_cctv(institute_id: int):
    institute = Institute.query.get(institute_id)
    if not institute:
        return api_error("Institute not found.", "NOT_FOUND", 404)

    return api_response({
        "institute_id": institute.id,
        "institute_name": institute.name,
        "cameras": [c.to_dict() for c in institute.cctv_cameras]
    })
