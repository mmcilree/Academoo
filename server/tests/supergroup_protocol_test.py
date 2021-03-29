import pytest
from app import create_app
from conftest import Constants, TestConfig

headers = {
    "Client-Host": "localhost:5000"
}

headers_with_user = dict(headers, **{"User-ID": "existent"})
headers_with_another_user = dict(headers, **{"User-ID": "TestUser2"})

def test_config():
    assert not create_app().testing
    assert create_app(TestConfig).testing

# Supergroup protocol
# Communities
def test_get_communities(client):
    response = client.get("api/communities", headers=headers)
    assert response.status_code == 200
    assert response.json == ["TestCommunity", "TestCommunity2"]

    response = client.get("api/communities")
    assert response.status_code == 400

def test_get_community_by_id(client):
    response = client.get("api/communities/TestCommunity", headers=headers)
    assert response.status_code == 200
    assert response.json == {
        "id": "TestCommunity",
        "title": "Test Community",
        "description": None,
        "admins": []
    }

    response = client.get("api/communities/nonexistent", headers=headers)
    assert response.status_code == 404

    response = client.get("api/communities/TestCommunity")
    assert response.status_code == 400

def test_get_community_timestamps(client):
    response = client.get("api/communities/TestCommunity/timestamps", headers=headers)
    assert response.status_code == 200
    assert response.json == [
        {"id": Constants.POST1_ID, "modified": 0}, 
        {"id": Constants.POST2_ID, "modified": 1},
    ]

    response = client.get("api/communities/nonexistent/timestamps", headers=headers)
    assert response.status_code == 404

    response = client.get("api/communities/TestCommunity/timestamps")
    assert response.status_code == 400

# Posts
def test_get_posts(client):
    response = client.get("api/posts", headers=headers_with_user)
    assert response.status_code == 200
    assert len(response.json) == 2

    response = client.get("api/posts?limit=1", headers=headers_with_user)
    assert response.status_code == 200
    assert len(response.json) == 1

    response = client.get("api/posts?community=TestCommunity2", headers=headers_with_user)
    assert response.status_code == 200
    assert len(response.json) == 0

    response = client.get("api/posts")
    assert response.status_code == 400

def test_create_posts(client):
    data = {
        "community": "TestCommunity",
        "title": "Test Post",
        "content": 
        [
            {
                "text": {
                    "text": "Hello World!"
                }
            }
        ]
    }
    response = client.post("api/posts", json=data, headers=headers_with_user)
    assert response.status_code == 201

    response = client.post("api/posts", json=data)
    assert response.status_code == 400

    response = client.post("api/posts", headers=headers_with_user)
    assert response.status_code == 400

def test_get_post_by_id(client):
    response = client.get(f"api/posts/{Constants.POST1_ID}", headers=headers_with_user)
    assert response.status_code == 200

    response = client.get(f"api/posts/{Constants.FAKE_POST_ID}", headers=headers_with_user)
    assert response.status_code == 404

    response = client.get(f"api/posts/{Constants.POST1_ID}")
    assert response.status_code == 400

def test_edit_post(client):
    data = {
        "title": "Update Title",
        "content": [
                {
                    "text": {
                        "text": "Hello There!"
                    }
                }
            ]
    }
    response = client.put(f"api/posts/{Constants.POST1_ID}", json=data, headers=headers_with_user)
    assert response.status_code == 200

    response = client.put(f"api/posts/{Constants.FAKE_POST_ID}", json=data, headers=headers_with_user)
    assert response.status_code == 404

    response = client.put(f"api/posts/{Constants.POST1_ID}", json=data)
    assert response.status_code == 400

    response = client.put(f"api/posts/{Constants.POST1_ID}", headers=headers_with_user)
    assert response.status_code == 400

    response = client.put(f"api/posts/{Constants.POST1_ID}", json=data, headers=headers_with_another_user)
    assert response.status_code == 403


def test_delete_post(client):
    response = client.delete(f"api/posts/{Constants.POST1_ID}")
    assert response.status_code == 400

    response = client.delete(f"api/posts/{Constants.POST1_ID}", headers=headers_with_user)
    assert response.status_code == 200

    response = client.delete(f"api/posts/{Constants.POST1_ID}", headers=headers_with_user)
    assert response.status_code == 404

    response = client.delete(f"api/posts/{Constants.POST2_ID}", headers=headers_with_another_user)
    assert response.status_code == 403


# Users
def test_get_users(client):
    response = client.get("api/users")
    assert response.status_code == 200
    assert len(response.json) == 2

def test_get_users_by_id(client):
    response = client.get("api/users/existent")
    assert response.status_code == 200

    response = client.get("api/users/nonexistent")
    assert response.status_code == 404

def test_get_server_public_key(client):
    response = client.get("api/key")
    assert response.status_code == 200

def test_discover(client):
    response = client.get("api/discover")
    assert response.status_code == 200
