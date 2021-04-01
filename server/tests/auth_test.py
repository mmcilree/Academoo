import pytest
from conftest import get_auth_tokens


def test_registration(client):
    response = client.post("api/register", json={
        "username": "TestUser",
        "password": "1234",
        "email": "test@test.com"
    })
    assert response.status_code == 200

    response = client.post("api/register", json={
        "username": "TestUser",
        "password": "1234",
        "email": "test@test.com"
    })
    assert response.status_code == 400


def test_login(client):
    response = client.post("api/login", json={
        "username": "existent",
        "password": "incorrect"
    })
    assert response.status_code == 401

    response = client.post("api/login", json={
        "username": "existent",
        "password": "1234"
    })
    assert response.status_code == 200


def test_protected_route(client):
    headers = get_auth_tokens(client)

    response = client.get("api/protected", headers=headers)
    assert response.status_code == 200

    response = client.get("api/protected")
    assert response.status_code == 401


def test_admin_route(client):
    headers_for_admin = get_auth_tokens(
        client, username="admin", password="admin")
    headers = get_auth_tokens(client)

    response = client.get("api/admin-protected", headers=headers_for_admin)
    assert response.status_code == 200

    response = client.get("api/admin-protected", headers=headers)
    assert response.status_code == 403

    response = client.get("api/admin-protected")
    assert response.status_code == 401


def test_refresh(client):
    # Token is expired!
    response = client.post(
        "api/refresh",
        data="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MTY5ODY0MDQsImV4cCI6MTYxNjk4NjQwNSwianRpIjoiMDE3NDdkOTMtOTI1Mi00NWU4LWE3MmYtNmU4OGI2ZjdjZDUyIiwiaWQiOiJleGlzdGVudCIsInJscyI6ImJhc2ljIiwicmZfZXhwIjo4ODAxNjk4NjQwNH0.U6Z7pheMWWPhbOt8NFVXXBcyOWPhU79OY7Avr1btKzk",
    )
    assert response.status_code == 200

    response = client.post("api/refresh")
    assert response.status_code == 401
