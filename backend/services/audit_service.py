from datetime import datetime, timezone
from backend.database import db
from backend.models.audit_log import AuditLog

class AuditService:
    @staticmethod
    def log(action: str, user_id=None, user_name=None, role=None, entity_type=None, entity_id=None, ip_address=None, details=None):
        try:
            log_entry = AuditLog(
                user_id=user_id,
                user_name=user_name,
                role=role,
                action=action,
                entity_type=entity_type,
                entity_id=str(entity_id) if entity_id is not None else None,
                ip_address=ip_address,
                details=details,
                timestamp=datetime.now(timezone.utc),
            )
            db.session.add(log_entry)
            db.session.commit()
            return log_entry
        except Exception as e:
            db.session.rollback()
            print(f"[AuditService] Failed to record audit log: {e}")
            return None
