import csv
import io
from flask import Blueprint, request, Response, g
from backend.database import db
from backend.models.institute import Institute
from backend.models.inspection import Inspection
from backend.models.corrective_action import CorrectiveAction
from backend.utils.auth import token_required, api_response

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("", methods=["GET"])
@token_required
def get_reports_summary():
    institutes = Institute.query.all()
    inspections = Inspection.query.all()
    corrective_actions = CorrectiveAction.query.all()

    report_items = []
    for inst in institutes:
        risk = inst.latest_risk
        report_items.append({
            "institute_id": inst.id,
            "institute_name": inst.name,
            "reg_number": inst.registration_number,
            "state": inst.state,
            "district": inst.district,
            "scheme": inst.scheme,
            "risk_score": risk.score if risk else 25,
            "risk_level": risk.risk_level if risk else "LOW",
            "reported_attendance": f"{inst.reported_attendance}%",
            "historical_attendance": f"{inst.historical_attendance}%",
            "pending_actions": sum(1 for ca in inst.corrective_actions if ca.status not in ["RESOLVED", "CLOSED"]),
            "last_inspection": inst.last_inspection_date.strftime("%Y-%m-%d") if inst.last_inspection_date else "Never",
        })

    return api_response({
        "data": report_items,
        "total": len(report_items)
    })

@reports_bp.route("/export-csv", methods=["GET"])
def export_csv():
    institutes = Institute.query.all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Institute ID", "Institute Name", "Registration Number", "State", "District",
        "Scheme", "Risk Score", "Risk Level", "Reported Attendance", "Historical Attendance",
        "Pending Compliance Count", "Active Complaints", "Last Inspection Date"
    ])

    for inst in institutes:
        risk = inst.latest_risk
        writer.writerow([
            inst.id,
            inst.name,
            inst.registration_number,
            inst.state,
            inst.district,
            inst.scheme,
            risk.score if risk else 25,
            risk.risk_level if risk else "LOW",
            f"{inst.reported_attendance}%",
            f"{inst.historical_attendance}%",
            inst.pending_compliance_count,
            inst.complaints_count,
            inst.last_inspection_date.strftime("%Y-%m-%d") if inst.last_inspection_date else "None"
        ])

    csv_data = output.getvalue()
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=inspectra_institutes_report.csv"}
    )
