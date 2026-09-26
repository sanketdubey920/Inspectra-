import pytest
from backend.app import create_app
from backend.config import Config
from backend.database import db
from backend.seed_data import seed_database

from datetime import timedelta

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

@pytest.fixture(scope="session")
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    with app.app_context():
        db.drop_all()
        db.create_all()
    return app.test_client()
