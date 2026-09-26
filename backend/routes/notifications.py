from flask import Blueprint, g
from backend.database import db
from backend.models.notification import Notification
from backend.utils.auth import token_required, api_response, api_error

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")

@notifications_bp.route("", methods=["GET"])
@token_required
def get_notifications():
    user = g.current_user
    notifs = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(30).all()
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()

    return api_response({
        "notifications": [n.to_dict() for n in notifs],
        "unread_count": unread_count,
        "total": len(notifs)
    })

@notifications_bp.route("/<int:notif_id>/read", methods=["PUT", "POST"])
@token_required
def mark_read(notif_id: int):
    notif = Notification.query.filter_by(id=notif_id, user_id=g.current_user.id).first()
    if not notif:
        return api_error("Notification not found.", "NOT_FOUND", 404)

    notif.is_read = True
    db.session.commit()
    return api_response(notif.to_dict(), "Notification marked as read.")

@notifications_bp.route("/read-all", methods=["PUT", "POST"])
@token_required
def mark_all_read():
    Notification.query.filter_by(user_id=g.current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return api_response(None, "All notifications marked as read.")

@notifications_bp.route("", methods=["POST"])
@token_required
def create_notification():
    from flask import request
    from backend.services.notification_service import NotificationService
    data = request.get_json() or {}
    title = data.get("title", "CCTV Anomaly Alert")
    message = data.get("message", "Unusual activity detected")
    notif_type = data.get("notification_type", "WARNING")
    link = data.get("link", "/cctv")
    
    notif = NotificationService.send(
        user_id=g.current_user.id,
        title=title,
        message=message,
        notification_type=notif_type,
        link=link
    )
    if not notif:
        return api_error("Failed to create notification.", "CREATE_FAILED", 500)
    return api_response(notif.to_dict(), "Notification created successfully.", 201)

