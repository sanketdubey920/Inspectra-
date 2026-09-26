import uuid
from datetime import datetime, timezone
from flask import Blueprint, request
from backend.database import db
from backend.models.complaint import Complaint
from backend.models.institute import Institute
from backend.services.risk_engine import RiskEngine
from backend.services.audit_service import AuditService
from backend.utils.auth import api_response, api_error

feedback_bp = Blueprint("feedback", __name__, url_prefix="/api/feedback")

@feedback_bp.route("", methods=["POST"])
def submit_feedback():
    data = request.get_json() or {}
    institute_id = data.get("institute_id")
    category = data.get("category", "General Operational Feedback")
    description = data.get("description", "")
    severity = data.get("severity", "MEDIUM")
    is_anonymous = bool(data.get("is_anonymous", False))
    name = data.get("name") if not is_anonymous else "Anonymous Beneficiary"
    contact = data.get("contact") if not is_anonymous else None

    if not institute_id or not description:
        return api_error("Institute ID and feedback description are required.", "VALIDATION_ERROR", 400)

    institute = Institute.query.get(institute_id)
    if not institute:
        return api_error("Institute not found.", "NOT_FOUND", 404)

    tracking_code = f"GRV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:6].upper()}"

    complaint = Complaint(
        institute_id=institute.id,
        tracking_code=tracking_code,
        category=category,
        description=description,
        severity=severity,
        is_anonymous=is_anonymous,
        complainant_name=name,
        complainant_contact=contact,
        status="PENDING",
        created_at=datetime.now(timezone.utc),
    )
    db.session.add(complaint)
    institute.complaints_count = (institute.complaints_count or 0) + 1
    db.session.commit()

    AuditService.log(
        action="FEEDBACK_SUBMITTED",
        entity_type="Complaint",
        entity_id=complaint.id,
        details=f"Feedback #{tracking_code} submitted for {institute.name} (Anonymous: {is_anonymous})."
    )

    # Trigger official alert notification
    try:
        from backend.services.notification_service import NotificationService
        NotificationService.broadcast_role(
            role="government_official",
            title=f"New Beneficiary Report: {category}",
            message=f"Report #{tracking_code} logged for {institute.name} ({institute.district}). Severity: {severity}.",
            notification_type="COMPLAINT",
            link="/beneficiary-reports"
        )
    except Exception:
        pass

    # Recalculate institute risk with fresh grievance data
    try:
        RiskEngine.calculate_institute_risk(institute.id)
    except Exception:
        pass

    return api_response({
        "tracking_code": tracking_code,
        "complaint": complaint.to_dict()
    }, "Feedback submitted successfully. Save your tracking code for updates.", 201)

@feedback_bp.route("/track/<string:tracking_code>", methods=["GET"])
def track_feedback(tracking_code: str):
    complaint = Complaint.query.filter_by(tracking_code=tracking_code.upper()).first()
    if not complaint:
        return api_error("Grievance tracking code not found.", "NOT_FOUND", 404)
    return api_response(complaint.to_dict())

@feedback_bp.route("", methods=["GET"])
def list_feedback():
    institute_id = request.args.get("institute_id")
    status = request.args.get("status")
    severity = request.args.get("severity")

    query = Complaint.query
    if institute_id:
        query = query.filter_by(institute_id=int(institute_id))
    if status and status.upper() != "ALL":
        query = query.filter_by(status=status.upper())
    if severity and severity.upper() != "ALL":
        query = query.filter_by(severity=severity.upper())

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return api_response({
        "feedback": [c.to_dict() for c in complaints],
        "total": len(complaints)
    })

@feedback_bp.route("/<int:complaint_id>/action", methods=["PUT", "PATCH"])
def take_action_on_feedback(complaint_id: int):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return api_error("Beneficiary report not found.", "NOT_FOUND", 404)

    data = request.get_json() or {}
    new_status = data.get("status")
    resolution_notes = data.get("resolution_notes")
    severity = data.get("severity")

    if new_status:
        complaint.status = new_status.upper()
        if complaint.status == "RESOLVED":
            complaint.resolved_at = datetime.now(timezone.utc)

    if resolution_notes is not None:
        complaint.resolution_notes = resolution_notes

    if severity:
        complaint.severity = severity.upper()

    db.session.commit()

    # Recalculate institute risk dynamically upon grievance resolution/update
    try:
        RiskEngine.calculate_institute_risk(complaint.institute_id)
    except Exception:
        pass

    AuditService.log(
        action="GRIEVANCE_ACTION_TAKEN",
        entity_type="Complaint",
        entity_id=complaint.id,
        details=f"Official action taken on #{complaint.tracking_code}: Status={complaint.status}. Remarks: {complaint.resolution_notes or 'None'}"
    )

    return api_response({
        "complaint": complaint.to_dict()
    }, "Official action recorded successfully.")
