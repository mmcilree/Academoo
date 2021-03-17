import pytest
from app import create_app, db

headers = {
    "Client-Host": "localhost:5000"
}

headers_with_user = dict(headers, **{"User-ID": "TestUser"})

class TestConfig(object):
    TESTING = True
    SECRET_KEY = "testing-is-so-much-fun"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

@pytest.fixture
def app():
    app = create_app(TestConfig)

    app.app_context().push()
    db.create_all()

    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

def test_config():
    assert not create_app().testing
    assert create_app(TestConfig).testing

# Supergroup protocol

# Communities
def test_get_communities(client):
    response = client.get("api/communities")
    assert response.status_code == 400

    response = client.get("api/communities", headers=headers)
    assert response.status_code == 200

def test_get_community_by_id(client):
    response = client.get("api/communities/nonexistent", headers=headers)
    assert response.status_code == 404

    response = client.get("api/communities/existent")
    assert response.status_code == 400

    response = client.get("api/communities/existent", headers=headers)
    assert response.status_code == 200

def test_get_community_timestamps(client):
    response = client.get("api/communities/nonexistent/timestamps", headers=headers)
    assert response.status_code == 404

    response = client.get("api/communities/existent/timestamp")
    assert response.status_code == 400

    response = client.get("api/communities/existent/timestamp", headers=headers)
    assert response.status_code == 200

# Posts
def test_get_posts(client):
    response = client.get("api/posts")
    assert response.status_code == 400

    response = client.get("api/posts", headers=headers_with_user)
    assert response.status_code == 200

    # TODO: Test filtering features

def test_create_posts(client):
    data = {
        "community": "TestCommunity",
        "title": "Test Post",
        "content": [
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
    response = client.get("api/posts/existent", headers=headers_with_user)
    assert response.status_code == 200

    response = client.get("api/posts/nonexistent", headers=headers_with_user)
    assert response.status_code == 404

    response = client.get("api/posts/existent")
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

    response = client.put("api/posts/existent", json=data, headers=headers_with_user)
    assert response.status_code == 200

    response = client.put("api/posts/nonexistent", json=data, headers=headers_with_user)
    assert response.status_code == 404

    response = client.put("api/posts/existent", json=data)
    assert response.status_code == 400

    response.client.put("api/posts/existent", headers=headers_with_user)
    assert resposne.status_code == 400

    # TODO: Test Error 403 forbidden


def test_delete_post(client):
    response = client.delete("api/posts/existent")
    assert response.status_code == 400

    response = client.delete("api/posts/existent", headers=headers_with_user)
    assert response.status_code == 200

    response = client.delete("api/posts/nonexistent", headers=headers_with_user)
    assert response.status_code == 404

    # TODO: Test Error 403 forbidden


# Users
def test_get_users(client):
    response = client.get("api/users")
    assert response.status_code == 200

    # TODO: prefix query is not implemented
    # response = client.get("api/user?prefix=nonexistent")

    # response = client.get('api.user?prefix=existent')
    # assert response.status_code == 200