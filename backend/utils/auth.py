import jwt
from functools import wraps
from datetime import datetime, timezone, timedelta
from flask import request, jsonify, current_app, g
from backend.database import db
from backend.models.user import User

def create_access_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "institute_id": user.institute_id,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + (current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES") or timedelta(hours=12))
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                "success": False,
                "error": {
                    "code": "AUTH_REQUIRED",
                    "message": "Authentication token missing or invalid."
                }
            }), 401

        try:
            payload = decode_access_token(token)
            user_id = int(payload["sub"])
            user = db.session.get(User, user_id)
            if not user or user.status != "ACTIVE":
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "USER_INACTIVE",
                        "message": "User account inactive or not found."
                    }
                }), 403
            g.current_user = user
        except jwt.ExpiredSignatureError as e:
            return jsonify({
                "success": False,
                "error": {
                    "code": "TOKEN_EXPIRED",
                    "message": "Session expired. Please log in again."
                }
            }), 401
        except Exception as e:
            print(f"[AUTH ERROR] {type(e).__name__}: {e}")
            return jsonify({
                "success": False,
                "error": {
                    "code": "TOKEN_INVALID",
                    "message": f"Invalid authentication credentials: {str(e)}"
                }
            }), 401

        return f(*args, **kwargs)
    return decorated

def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if g.current_user.role not in roles:
                return jsonify({
                    "success": False,
                    "error": {
                        "code": "PERMISSION_DENIED",
                        "message": f"Access restricted. Required role(s): {', '.join(roles)}."
                    }
                }), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

def api_response(data=None, message="Operation successful", status=200):
    response = {
        "success": True,
        "data": data if data is not None else {},
        "message": message
    }
    return jsonify(response), status

def api_error(message="An error occurred", code="ERROR", status=400, details=None):
    response = {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details:
        response["error"]["details"] = details
    return jsonify(response), status
