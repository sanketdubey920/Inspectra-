import time
from flask import Blueprint, Response, request, send_file
import io
from backend.database import db
from backend.models.cctv import CCTVCamera
from backend.models.institute import Institute
from backend.services.cctv_service import CCTVService
from backend.utils.auth import api_response, api_error

cctv_bp = Blueprint("cctv", __name__, url_prefix="/api/cctv")

@cctv_bp.route("/<int:camera_id>/snapshot", methods=["GET"])
def get_camera_snapshot(camera_id: int):
    camera = CCTVCamera.query.get(camera_id)
    if not camera:
        return api_error("Camera not found.", "NOT_FOUND", 404)

    inst_name = camera.institute.name if camera.institute else "Institute"
    jpeg_bytes = CCTVService.generate_simulated_frame(
        institute_name=inst_name,
        room_name=camera.room,
        activity_level=camera.activity_level,
        occupancy=camera.occupancy_count
    )
    return Response(jpeg_bytes, mimetype="image/jpeg")

@cctv_bp.route("/<int:camera_id>/stream", methods=["GET"])
def get_camera_stream(camera_id: int):
    camera = CCTVCamera.query.get(camera_id)
    if not camera:
        return api_error("Camera not found.", "NOT_FOUND", 404)

    inst_name = camera.institute.name if camera.institute else "Institute"

    def frame_generator():
        # Yield simulated MJPEG frames
        while True:
            frame_bytes = CCTVService.generate_simulated_frame(
                institute_name=inst_name,
                room_name=camera.room,
                activity_level=camera.activity_level,
                occupancy=camera.occupancy_count
            )
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(0.5)  # 2 fps for efficient simulation

    return Response(frame_generator(), mimetype="multipart/x-mixed-replace; boundary=frame")

@cctv_bp.route("/institutes/<int:institute_id>", methods=["GET"])
def get_institute_cameras(institute_id: int):
    institute = Institute.query.get(institute_id)
    if not institute:
        return api_error("Institute not found.", "NOT_FOUND", 404)

    # If this institute does not have cameras in database, dynamically provision domain-specific cameras
    if not institute.cctv_cameras or len(institute.cctv_cameras) == 0:
        inst_type = (institute.institute_type or '').lower()
        inst_name = (institute.name or '').lower()
        scheme_str = (institute.scheme or '').lower()

        # Domain classification
        if any(w in inst_type or w in inst_name for w in ['residential', 'hostel', 'old age', 'senior', 'shelter']) or 'ipsrc' in scheme_str:
            cams_data = [
                ("CAM-01", "Resident Living Area & Lounge", 74.0, 16, False),
                ("CAM-02", "Dining Hall & Nutrition Mess", 80.0, 22, False),
                ("CAM-03", "Hostel Living Quarters Corridor", 62.0, 9, False),
                ("CAM-04", "Medical & Nursing Care Station", 58.0, 4, False),
                ("CAM-05", "Campus Reception & Visitor Desk", 84.0, 5, False),
            ]
        elif any(w in inst_type or w in inst_name for w in ['vocational', 'college', 'training', 'skill', 'polytechnic']) or 'daksh' in scheme_str:
            cams_data = [
                ("CAM-01", "College Main Entrance & Turnstile", 88.0, 14, False),
                ("CAM-02", "Technical Trades Workshop Floor", 78.0, 18, False),
                ("CAM-03", "Advanced Computer & IT Lab", 82.0, 25, False),
                ("CAM-04", "Lecture Hall — Skill Development", 70.0, 28, False),
                ("CAM-05", "Vocational Training Practical Bay", 76.0, 15, False),
            ]
        else: # Special School / Rehabilitation Academy
            cams_data = [
                ("CAM-01", "Primary Special Education Classroom", 78.0, 16, False),
                ("CAM-02", "Speech & Occupational Therapy Lab", 65.0, 5, False),
                ("CAM-03", "Sensory Activity & Play Simulation Room", 82.0, 14, False),
                ("CAM-04", "School Campus & Assembly Ground", 72.0, 26, False),
                ("CAM-05", "Administrative Office & Staff Room", 64.0, 4, False),
            ]

        for cam_name, room, act, occ, unusual in cams_data:
            c = CCTVCamera(
                institute_id=institute.id,
                camera_name=cam_name,
                room=room,
                status="ONLINE",
                activity_level=act,
                occupancy_count=occ,
                unusual_inactivity=unusual
            )
            db.session.add(c)
        db.session.commit()

    return api_response({
        "institute_id": institute.id,
        "institute_name": institute.name,
        "institute_type": institute.institute_type,
        "scheme": institute.scheme,
        "cameras": [c.to_dict() for c in institute.cctv_cameras]
    })

