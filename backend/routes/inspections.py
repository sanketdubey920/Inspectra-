import os
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, g, current_app
from werkzeug.utils import secure_filename
from backend.database import db
from backend.models.inspection import Inspection
from backend.models.checklist import InspectionChecklist
from backend.models.evidence import Evidence
from backend.models.institute import Institute
from backend.models.user import User
from backend.services.inspection_service import InspectionService
from backend.services.audit_service import AuditService
from backend.services.notification_service import NotificationService
from backend.utils.auth import token_required, roles_required, api_response, api_error

inspections_bp = Blueprint("inspections", __name__, url_prefix="/api/inspections")

@inspections_bp.route("", methods=["GET"])
@token_required
def list_inspections():
    query = Inspection.query
    user = g.current_user

    if user.role == "inspection_officer":
        query = query.filter(Inspection.inspector_id == user.id)
    elif user.role == "institute_representative" and user.institute_id:
        query = query.filter(Inspection.institute_id == user.institute_id)

    status = request.args.get("status")
    priority = request.args.get("priority")
    inst_id = request.args.get("institute_id")

    if status:
        query = query.filter(Inspection.status == status.upper())
    if priority:
        query = query.filter(Inspection.priority == priority.upper())
    if inst_id:
        query = query.filter(Inspection.institute_id == int(inst_id))

    inspections = query.order_by(Inspection.created_at.desc()).all()
    return api_response({
        "inspections": [insp.to_dict() for insp in inspections],
        "total": len(inspections)
    })

@inspections_bp.route("/<int:inspection_id>", methods=["GET"])
@token_required
def get_inspection_detail(inspection_id: int):
    inspection = Inspection.query.get(inspection_id)
    if not inspection:
        return api_error("Inspection record not found.", "NOT_FOUND", 404)

    return api_response(inspection.to_dict(include_details=True))

@inspections_bp.route("", methods=["POST"])
@roles_required("department_official")
def assign_inspection():
    data = request.get_json() or {}
    institute_id = data.get("institute_id")
    inspector_id = data.get("inspector_id")
    inspection_type = data.get("inspection_type", "SURPRISE")
    priority = data.get("priority", "HIGH")
    special_instructions = data.get("special_instructions", "")

    if not institute_id or not inspector_id:
        return api_error("Institute ID and Inspector ID are required.", "VALIDATION_ERROR", 400)

    institute = Institute.query.get(institute_id)
    inspector = User.query.get(inspector_id)

    if not institute or not inspector:
        return api_error("Specified institute or inspector does not exist.", "NOT_FOUND", 404)

    # Capture risk context
    latest_risk = institute.latest_risk
    risk_score = latest_risk.score if latest_risk else 25
    risk_level = latest_risk.risk_level if latest_risk else "LOW"
    reasons = ", ".join([f.factor_name for f in latest_risk.factors if f.points > 0]) if latest_risk else "Routine"

    new_inspection = Inspection(
        institute_id=institute.id,
        inspector_id=inspector.id,
        inspection_type=inspection_type,
        priority=priority,
        status="ASSIGNED",
        trigger_risk_score=risk_score,
        trigger_risk_level=risk_level,
        trigger_reasons=reasons,
        special_instructions=special_instructions,
        expected_latitude=institute.latitude,
        expected_longitude=institute.longitude,
        scheduled_date=datetime.now(timezone.utc),
    )
    db.session.add(new_inspection)
    db.session.commit()

    # Generate targeted checklist based on risk factors
    factors_list = [f.to_dict() for f in latest_risk.factors] if latest_risk else []
    InspectionService.generate_targeted_checklist(new_inspection, factors_list)

    # Notify Inspector
    NotificationService.send(
        user_id=inspector.id,
        title=f"New {priority} Inspection Assigned",
        message=f"You have been assigned for a {inspection_type} inspection at {institute.name}.",
        notification_type="INSPECTION_ASSIGNED",
        link=f"/inspector/inspections/{new_inspection.id}"
    )

    # Log Audit
    AuditService.log(
        action="INSPECTION_ASSIGNED",
        user_id=g.current_user.id,
        user_name=g.current_user.name,
        role=g.current_user.role,
        entity_type="Inspection",
        entity_id=new_inspection.id,
        details=f"Assigned {inspection_type} inspection for {institute.name} to {inspector.name} (Risk: {risk_score} {risk_level})."
    )

    return api_response(new_inspection.to_dict(include_details=True), "Inspection assigned and targeted checklist generated successfully.", 201)

@inspections_bp.route("/<int:inspection_id>/start", methods=["POST"])
@token_required
def start_inspection(inspection_id: int):
    inspection = Inspection.query.get(inspection_id)
    if not inspection:
        return api_error("Inspection not found.", "NOT_FOUND", 404)

    if inspection.status == "ASSIGNED":
        inspection.status = "IN_PROGRESS"
        inspection.started_at = datetime.now(timezone.utc)
        db.session.commit()

    return api_response(inspection.to_dict(), "Inspection marked in-progress.")

@inspections_bp.route("/<int:inspection_id>/gps", methods=["POST"])
@token_required
def verify_gps(inspection_id: int):
    inspection = Inspection.query.get(inspection_id)
    if not inspection:
        return api_error("Inspection not found.", "NOT_FOUND", 404)

    data = request.get_json() or {}
    lat = data.get("latitude")
    lon = data.get("longitude")

    if lat is None or lon is None:
        return api_error("Latitude and longitude coordinates are required.", "VALIDATION_ERROR", 400)

    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return api_error("Invalid coordinate values.", "VALIDATION_ERROR", 400)

    allowed_radius = current_app.config.get("ALLOWED_GPS_RADIUS_METERS", 500.0)
    result = InspectionService.verify_inspector_gps(inspection, lat, lon, allowed_radius)

    AuditService.log(
        action="GPS_VERIFIED",
        user_id=g.current_user.id,
        user_name=g.current_user.name,
        role=g.current_user.role,
        entity_type="Inspection",
        entity_id=inspection.id,
        details=f"GPS verified: {result['status']} (Distance: {result['distance_meters']}m vs {allowed_radius}m tolerance)."
    )

    return api_response(result, f"Location verification completed: {result['status']}.")

@inspections_bp.route("/<int:inspection_id>/checklist", methods=["POST"])
@token_required
def update_checklist_items(inspection_id: int):
    inspection = Inspection.query.get(inspection_id)
    if not inspection:
        return api_error("Inspection not found.", "NOT_FOUND", 404)

    data = request.get_json() or {}
    items = data.get("items", [])

    for it in items:
        item_id = it.get("id")
        cl_record = InspectionChecklist.query.filter_by(id=item_id, inspection_id=inspection.id).first()
        if cl_record:
            if "status" in it:
                cl_record.status = it["status"]
            if "notes" in it:
                cl_record.notes = it["notes"]

    db.session.commit()
    return api_response({
        "checklists": [c.to_dict() for c in inspection.checklists]
    }, "Checklist updated successfully.")

@inspections_bp.route("/<int:inspection_id>/evidence", methods=["POST"])
@token_required
def upload_evidence(inspection_id: int):
    inspection = Inspection.query.get(inspection_id)
    if not inspection:
        return api_error("Inspection not found.", "NOT_FOUND", 404)

    # Accept multipart/form-data or json payload with base64 / mock url
    category = request.form.get("category", "General Verification")
    description = request.form.get("description", "")
    lat = float(request.form.get("latitude", inspection.verified_latitude or inspection.institute.latitude))
    lon = float(request.form.get("longitude", inspection.verified_longitude or inspection.institute.longitude))
    evidence_type = request.form.get("evidence_type", "PHOTO")

    file_url = None
    file_name = None
    file_size = 0

    if "file" in request.files:
        file = request.files["file"]
        if file and file.filename:
            file_name = secure_filename(file.filename)
            unique_name = f"{uuid.uuid4().hex}_{file_name}"
            upload_dir = current_app.config["UPLOAD_FOLDER"]
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, unique_name)
            file.save(file_path)
            file_size = os.path.getsize(file_path)
            file_url = f"/api/uploads/{unique_name}"
    else:
        # Support simulated / captured base64 or fallback path for mobile/web demo
        mock_file = request.form.get("file_url") or request.json.get("file_url") if request.is_json else None
        if mock_file:
            file_url = mock_file
            file_name = f"evidence_{uuid.uuid4().hex[:8]}.jpg"
        else:
            file_url = f"/api/uploads/sample_evidence_{category.lower().replace(' ', '_')}.jpg"
            file_name = f"evidence_{category.lower().replace(' ', '_')}.jpg"

    evidence = Evidence(
        inspection_id=inspection.id,
        institute_id=inspection.institute_id,
        inspector_id=g.current_user.id,
        evidence_type=evidence_type,
        category=category,
        file_url=file_url,
        file_name=file_name,
        file_size_bytes=file_size,
        latitude=lat,
        longitude=lon,
        description=description,
        captured_at=datetime.now(timezone.utc),
    )
    db.session.add(evidence)
    db.session.commit()

    AuditService.log(
        action="EVIDENCE_UPLOADED",
        user_id=g.current_user.id,
        user_name=g.current_user.name,
        role=g.current_user.role,
        entity_type="Evidence",
        entity_id=evidence.id,
        details=f"Geo-tagged {evidence_type} uploaded for {category} at ({lat}, {lon})."
    )

    return api_response(evidence.to_dict(), "Evidence uploaded and geo-tagged successfully.", 201)

@inspections_bp.route("/<int:inspection_id>/submit", methods=["POST"])
@token_required
def submit_inspection_report(inspection_id: int):
    inspection = Inspection.query.get(inspection_id)
    if not inspection:
        return api_error("Inspection not found.", "NOT_FOUND", 404)

    data = request.get_json() or {}
    reported_att = data.get("reported_attendance_pct", inspection.institute.reported_attendance)
    verified_att = data.get("verified_attendance_pct", 68.0)  # Inspector verified e.g. 68%
    staff_present = data.get("staff_present_count", 4)
    staff_total = data.get("staff_total_count", 6)
    beneficiaries_verified = data.get("beneficiaries_verified_count", 42)
    observations = data.get("observations", "Verified attendance mismatch. Classroom 2 facility maintenance needed.")
    final_status = data.get("final_status", "PARTIALLY_COMPLIANT")

    inspection.reported_attendance_pct = reported_att
    inspection.verified_attendance_pct = verified_att
    inspection.staff_present_count = staff_present
    inspection.staff_total_count = staff_total
    inspection.beneficiaries_verified_count = beneficiaries_verified
    inspection.observations = observations
    inspection.final_status = final_status
    inspection.status = "SUBMITTED"
    inspection.submitted_at = datetime.now(timezone.utc)

    # Update institute last inspection
    inspection.institute.last_inspection_date = datetime.now(timezone.utc)
    db.session.commit()

    # Notify Department Officials
    officials = User.query.filter_by(role="department_official", status="ACTIVE").all()
    for off in officials:
        NotificationService.send(
            user_id=off.id,
            title=f"Inspection Report Submitted: {inspection.institute.name}",
            message=f"Inspector {g.current_user.name} submitted inspection report. Status: {final_status}.",
            notification_type="REPORT_SUBMITTED",
            link=f"/official/inspections/{inspection.id}"
        )

    AuditService.log(
        action="REPORT_SUBMITTED",
        user_id=g.current_user.id,
        user_name=g.current_user.name,
        role=g.current_user.role,
        entity_type="Inspection",
        entity_id=inspection.id,
        details=f"Inspection report submitted by {g.current_user.name}. Verified attendance: {verified_att}% vs reported {reported_att}%."
    )

    return api_response(inspection.to_dict(include_details=True), "Digital inspection report submitted for official review.")

@inspections_bp.route("/<int:inspection_id>/review", methods=["POST"])
@roles_required("department_official")
def review_inspection(inspection_id: int):
    inspection = Inspection.query.get(inspection_id)
    if not inspection:
        return api_error("Inspection not found.", "NOT_FOUND", 404)

    data = request.get_json() or {}
    final_status = data.get("final_status", inspection.final_status)
    remarks = data.get("remarks", "Reviewed and verified on-ground findings.")

    inspection.final_status = final_status
    inspection.official_remarks = remarks
    inspection.reviewed_by_id = g.current_user.id
    inspection.reviewed_at = datetime.now(timezone.utc)
    inspection.status = "REVIEWED"
    db.session.commit()

    AuditService.log(
        action="REPORT_REVIEWED",
        user_id=g.current_user.id,
        user_name=g.current_user.name,
        role=g.current_user.role,
        entity_type="Inspection",
        entity_id=inspection.id,
        details=f"Official {g.current_user.name} concluded review. Final status: {final_status}."
    )

    return api_response(inspection.to_dict(include_details=True), "Official review recorded.")
