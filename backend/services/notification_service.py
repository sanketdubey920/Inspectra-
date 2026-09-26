from datetime import datetime, timezone
from backend.database import db
from backend.models.notification import Notification

class NotificationService:
    @staticmethod
    def send(user_id: int, title: str, message: str, notification_type: str = "INFO", link: str = None):
        try:
            notif = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                link=link,
                is_read=False,
                created_at=datetime.now(timezone.utc),
            )
            db.session.add(notif)
            db.session.commit()
            return notif
        except Exception as e:
            db.session.rollback()
            print(f"[NotificationService] Failed to create notification: {e}")
            return None

    @staticmethod
    def broadcast_role(role: str, title: str, message: str, notification_type: str = "INFO", link: str = None):
        try:
            from backend.models.user import User
            users = User.query.filter_by(role=role).all()
            if not users:
                u1 = User.query.get(1)
                users = [u1] if u1 else []
            for u in users:
                notif = Notification(
                    user_id=u.id,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                    link=link,
                    is_read=False,
                    created_at=datetime.now(timezone.utc),
                )
                db.session.add(notif)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"[NotificationService] Failed to broadcast notification: {e}")
