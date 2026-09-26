import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "inspectra-dev-secret-key-2025-gov-dosje")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "inspectra-jwt-super-secret-secure-token-dosje-2025")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
    
    # Database: Default to SQLite for zero-friction local run; supports PostgreSQL via DATABASE_URL
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or f"sqlite:///{os.path.join(BASE_DIR, 'inspectra.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024  # 32 MB max
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf", "mp4", "webm"}

    # Geo-verification radius in meters
    ALLOWED_GPS_RADIUS_METERS = float(os.environ.get("ALLOWED_GPS_RADIUS_METERS", "500.0"))

    # Configurable Risk Engine Weights (Sum = 100)
    RISK_WEIGHTS = {
        "attendance_anomaly": 20,
        "compliance_issue": 20,
        "complaints": 15,
        "previous_inspection_issue": 15,
        "reporting_delay": 10,
        "activity_anomaly": 10,
    }

    # Risk Levels Thresholds
    RISK_LEVELS = {
        "LOW": (0, 30),
        "MEDIUM": (31, 50),
        "HIGH": (51, 75),
        "CRITICAL": (76, 100),
    }

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
