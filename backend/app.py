import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.database import db

# Import Blueprints
from backend.routes.auth import auth_bp
from backend.routes.institutes import institutes_bp
from backend.routes.inspections import inspections_bp
from backend.routes.corrective_actions import corrective_actions_bp
from backend.routes.risk import risk_bp
from backend.routes.cctv import cctv_bp
from backend.routes.alerts import alerts_bp
from backend.routes.reports import reports_bp
from backend.routes.feedback import feedback_bp
from backend.routes.notifications import notifications_bp
from backend.routes.audit import audit_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)

    # Ensure uploads directory exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(institutes_bp)
    app.register_blueprint(inspections_bp)
    app.register_blueprint(corrective_actions_bp)
    app.register_blueprint(risk_bp)
    app.register_blueprint(cctv_bp)
    app.register_blueprint(alerts_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(feedback_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(audit_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "INSPECTRA API Engine",
            "version": "1.0.0",
            "db_dialect": str(db.engine.url.get_backend_name()) if db.engine else "sqlite"
        })

    @app.route("/api/uploads/<path:filename>", methods=["GET"])
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.errorhandler(404)
    def handle_404(e):
        return jsonify({
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": "The requested API endpoint was not found."
            }
        }), 404

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal error occurred. Please try again later."
            }
        }), 500

    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
