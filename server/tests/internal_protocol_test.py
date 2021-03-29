import pytest
from conftest import Constants, get_auth_tokens

def test_assign_role(client):
    pass

def test_default_role(client):
    # Set and Get for default role

    response = client.get("api/get-default-role/TestCommunity")
    assert response.json["default_role"] == "contributor"

    response = client.post("api/set-default-role", json = {
        "role": "admin",
        "community": "TestCommunity"
    })
    assert response.status_code == 200

    response = client.get("api/get-default-role/TestCommunity")
    assert response.status_code == 200
    assert response.json["default_role"] == "admin"

    response = client.get("api/get-default-role/TestCommunity2")
    assert response.status_code == 200
    assert response.json["default_role"] == "contributor"

def test_get_community_roles(client):
    response = client.get("api/get-community-roles/TestCommunity")
    assert response.status_code == 200
    assert len(response.json) == 5

def test_sitewide_roles(client):
    pass

def test_account_activation(client):
    pass

def test_create_community(client):
    response = client.post("api/create-community")
    assert response.status_code == 400

    response = client.post("api/create-community", json={})
    assert response.status_code == 400

    data = {
        "id": "TestCommunity3",
        "title": "Test Community 3",
        "description": "This is a test community",
        "admin": "existent"
    }
    response = client.post("api/create-community", json=data)
    assert response.status_code == 200

    response = client.post("api/create-community", json=data)
    assert response.status_code == 400

    data["id"] = "TestCommunity4"; data["admin"] = "nonexistent"
    response = client.post("api/create-community", json=data)
    assert response.status_code == 404

def test_update_bio(client):
    headers = get_auth_tokens(client)

    response = client.post("api/update-bio", headers=headers, json={
        "bio": "Newly updated bio!"
    })
    assert response.status_code == 200

    response = client.post("api/update-bio", headers=headers)
    assert response.status_code == 400

    response = client.post("api/update-bio", headers=headers, json={})
    assert response.status_code == 400

def test_update_privacy(client):
    headers = get_auth_tokens(client)

    response = client.post("api/update-privacy", headers=headers, json={
        "private": "private"
    })
    assert response.status_code == 200

    response = client.post("api/update-privacy", headers=headers)
    assert response.status_code == 400

    response = client.post("api/update-privacy", headers=headers, json={})
    assert response.status_code == 400

def test_change_password(client):
    headers = get_auth_tokens(client)

    response = client.post("api/change-password", headers=headers, json={
        "old_password": "1234",
        "new_password": "abdc"
    })
    assert response.status_code == 200
    
    response = client.post("api/change-password", headers=headers, json={
        "old_password": "incorrect password",
        "new_password": "abdc"
    })
    assert response.status_code == 401

    response = client.post("api/change-password", headers=headers)
    assert response.status_code == 400

    response = client.post("api/change-password", headers=headers, json={})
    assert response.status_code == 400

def test_get_user(client):
    headers = get_auth_tokens(client)

    response = client.get("api/get-user", headers=headers)
    assert response.status_code == 200

    excepted_output = {
        'adminOf': [], 
        'bio': None, 
        'email': None, 
        'host': 'test.com', 
        'id': 'existent', 
        'private': False, 
        'site_roles': 'basic', 
        'subscriptions': []
    }
    assert response.json == excepted_output

def test_subscription(client):
    headers = get_auth_tokens(client)

    response = client.post("api/subscribe", headers=headers, json={
        "id": "TestCommunity"
    })
    assert response.status_code == 200

    user_details = client.get("api/get-user", headers=headers).json
    assert len(user_details["subscriptions"]) == 1

    response = client.post("api/unsubscribe", headers=headers, json={
        "id": "TestCommunity"
    })
    assert response.status_code == 200

    user_details = client.get("api/get-user", headers=headers).json
    assert len(user_details["subscriptions"]) == 0

    response = client.post("api/subscribe", headers=headers, json={
        "id": "nonexistent"
    })
    assert response.status_code == 400

    response = client.post("api/unsubscribe", headers=headers, json={
        "id": "nonexistent"
    })
    assert response.status_code == 400

    response = client.post("api/unsubscribe", headers=headers, json={
        "id": "TestCommunity"
    })
    assert response.status_code == 200