from flask import Blueprint, request
from backend.database import db
from backend.models.audit_log import AuditLog
from backend.utils.auth import token_required, roles_required, api_response

audit_bp = Blueprint("audit", __name__, url_prefix="/api/audit-logs")

@audit_bp.route("", methods=["GET"])
@roles_required("department_official")
def get_audit_logs():
    action = request.args.get("action")
    role = request.args.get("role")
    entity_type = request.args.get("entity_type")

    query = AuditLog.query

    if action:
        query = query.filter(AuditLog.action == action.upper())
    if role:
        query = query.filter(AuditLog.role == role)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    logs = query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return api_response({
        "audit_logs": [log.to_dict() for log in logs],
        "total": len(logs)
    })
