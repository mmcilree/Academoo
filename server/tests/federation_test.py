import pytest
from conftest import Constants

headers = {
    "Client-Host": "localhost:5000"
}

headers_with_user = dict(headers, **{"User-ID": "existent"})

def test_get_communities(client, requests_mock):
    requests_mock.get("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/communities", json=[])

    response = client.get("api/communities?external=academoo", headers=headers)
    assert response.status_code == 200

    response = client.get("api/communities?external=academoo")
    assert response.status_code == 400

def test_get_community_by_id(client, requests_mock):
    requests_mock.get("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/communities/TestCommunity", json={
        "id": "TestCommunity",
        "title": "Test Community",
        "description": "Description!",
        "admins": []
    })
    requests_mock.get("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/communities/BadJSON", json={})

    response = client.get("api/communities/TestCommunity?external=academoo", headers=headers)
    assert response.status_code == 200

    response = client.get("api/communities/TestCommunity?external=academoo")
    assert response.status_code == 400

    response = client.get("api/communities/BadJSON?external=academoo", headers=headers)
    assert response.status_code == 400

def test_get_posts(client, requests_mock):
    requests_mock.get("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts", json={})
    requests_mock.get("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/communities/TestCommunity/timestamps", json=[])

    response = client.get("api/posts?community=TestCommunity&external=academoo", headers=headers_with_user)
    assert response.status_code == 400

    requests_mock.get("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts", json=[])
    response = client.get("api/posts?community=TestCommunity&external=academoo", headers=headers_with_user)
    assert response.status_code == 200

def test_create_posts(client, requests_mock):
    requests_mock.post("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts", status_code=201)

    data = {
        "community": "TestCommunity",
        "title": "Test Post",
        "external": "academoo",
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

def test_get_post_by_id(client, requests_mock):
    requests_mock.get(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts/{Constants.POST1_ID}", json={})

    response = client.get(f"api/posts/{Constants.POST1_ID}", headers=headers_with_user)
    assert response.status_code == 200

    response = client.get(f"api/posts/{Constants.POST1_ID}")
    assert response.status_code == 400

def test_edit_post(client, requests_mock):
    requests_mock.put(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts/{Constants.POST1_ID}", status_code=200)
    data = {
        "title": "Update Title",
        "external": "academoo",
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

    response = client.put(f"api/posts/{Constants.POST1_ID}", json=data)
    assert response.status_code == 400

    response = client.put(f"api/posts/{Constants.POST1_ID}", headers=headers_with_user)
    assert response.status_code == 400

def test_delete_post(client, requests_mock):
    requests_mock.delete(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts/{Constants.POST1_ID}", status_code=200)

    response = client.delete(f"api/posts/{Constants.POST1_ID}?external=academoo")
    assert response.status_code == 400

    response = client.delete(f"api/posts/{Constants.POST1_ID}?external=academoo", headers=headers_with_user)
    assert response.status_code == 200

def test_get_users(client, requests_mock):
    requests_mock.get(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/users", json=[])

    response = client.get("api/users?external=academoo")
    assert response.status_code == 200
    assert len(response.json) == 0

def test_get_users_by_id(client, requests_mock):
    requests_mock.get(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/users/existent", json={})

    response = client.get("api/users/existent")
    assert response.status_code == 200