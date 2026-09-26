import json
from backend.models.user import User
from backend.database import db

def test_login_and_auth_me(client, app):
    with app.app_context():
        user = User(
            name="Test Official",
            email="test.official@inspectra.demo",
            role="department_official",
            status="ACTIVE"
        )
        user.set_password("Secret@123")
        db.session.add(user)
        db.session.commit()

    # Login
    res = client.post("/api/auth/login", json={
        "email": "test.official@inspectra.demo",
        "password": "Secret@123"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "token" in data["data"]
    token = data["data"]["token"]

    # Access protected route /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.get_json()
    assert me_data["data"]["user"]["email"] == "test.official@inspectra.demo"
    assert me_data["data"]["user"]["role"] == "department_official"

def test_invalid_login(client):
    res = client.post("/api/auth/login", json={
        "email": "nonexistent@inspectra.demo",
        "password": "wrong"
    })
    assert res.status_code == 401
    data = res.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_CREDENTIALS"
