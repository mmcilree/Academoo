import pytest
from conftest import Constants, get_auth_tokens


def test_assign_role(client):
    response = client.post("api/assign-role",
                           headers={
                               "User-ID": "existent"
                           },
                           json={
                               "host": "local",
                               "user": "existent",
                               "community": "TestCommunity",
                               "role": "admin"
                           }
                           )
    assert response.status_code == 403

    response = client.post("api/assign-role",
                           headers={
                               "User-ID": "admin"
                           },
                           json={
                               "host": "local",
                               "user": "existent",
                               "community": "TestCommunity",
                               "role": "admin"
                           }
                           )
    assert response.status_code == 200

    response = client.post("api/assign-role",
                           headers={
                               "User-ID": "admin"
                           },
                           json={
                               "host": "local",
                               "user": "nonexistent",
                               "community": "TestCommunity",
                               "role": "admin"
                           }
                           )
    assert response.status_code == 400

    response = client.post("api/assign-role",
                           headers={
                               "User-ID": "admin"
                           },
                           json={
                               "host": None,
                               "user": "external_user",
                               "community": "TestCommunity",
                               "role": "admin"
                           }
                           )
    assert response.status_code == 400


    response = client.post("api/assign-role",
                           headers={
                               "User-ID": "admin"
                           },
                           json={
                               "host": "external",
                               "user": "external_user",
                               "community": "TestCommunity",
                               "role": "admin"
                           }
                           )
    assert response.status_code == 200

    response = client.post("api/assign-role",
                        headers={
                            "User-ID": "existent"
                        },
                        json={
                            "host": "local",
                            "user": "existent",
                            "community": "TestCommunity",
                            "role": "admin"
                        }
                        )
    assert response.status_code == 400


def test_default_role(client):
    # Set and Get for default role

    response = client.get("api/get-default-role/TestCommunity")
    assert response.json["default_role"] == "contributor"

    response = client.post("api/set-default-role", json={
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
    headers = get_auth_tokens(client)
    headers_for_admin = get_auth_tokens(
        client, username="admin", password="admin")

    response = client.post("api/add-site-role", headers=headers_for_admin)
    assert response.status_code == 400

    response = client.post("api/add-site-role",
                           headers=headers_for_admin, json={})
    assert response.status_code == 400

    response = client.put("api/remove-site-roles", headers=headers_for_admin)
    assert response.status_code == 400

    response = client.put("api/remove-site-roles",
                          headers=headers_for_admin, json={})
    assert response.status_code == 400

    response = client.post("api/add-site-role", headers=headers, json={
        "admin": "nonexistent",
        "username": "existent",
        "key": "lh87GFL3DHkkMsw098An",
        "role": "site-moderator",
        "host": "local"
    })
    assert response.status_code == 200

    response = client.post("api/add-site-role", headers=headers, json={
        "admin": "admin",
        "username": "existent",
        "key": "lh87GFL3DHkkMsw098An",
        "role": "site-moderator",
        "host": "local"
    })
    assert response.status_code == 400

    response = client.post("api/add-site-role", headers=headers, json={
        "admin": "admin",
        "username": "existent",
        "key": "lh87GFL3DHkkMsw098An",
        "role": "site-admin",
        "host": "local"
    })
    assert response.status_code == 200

    response = client.post("api/add-site-role", headers=headers, json={
        "admin": "admin",
        "username": "existent",
        "key": "lh87GFL3DHkkMsw098An",
        "role": "site-admin",
        "host": "local"
    })
    assert response.status_code == 400

    response = client.post("api/add-site-role", headers=headers, json={
        "admin": "TestUser2",
        "username": "existent",
        "key": "no-key",
        "role": "site-moderator",
        "host": "local"
    })
    assert response.status_code == 400

    response = client.post("api/add-site-role", headers=headers, json={
        "admin": "TestUser2",
        "username": "TestUser2",
        "key": "no-key",
        "role": "site-moderator",
        "host": "local"
    })
    assert response.status_code == 401

    response = client.post("api/add-site-role", headers=headers, json={
        "admin": "admin",
        "username": "nonexistent",
        "key": "lh87GFL3DHkkMsw098An",
        "role": "site-moderator",
        "host": "local"
    })
    assert response.status_code == 404

    response = client.put("api/remove-site-roles", headers=headers, json={
        "host": "local",
        "username": "existent"
    })
    assert response.status_code == 403

    response = client.put("api/remove-site-roles", headers=headers_for_admin, json={
        "host": "local",
        "username": "existent"
    })
    assert response.status_code == 200

    response = client.put("api/remove-site-roles", headers=headers_for_admin, json={
        "host": "local",
        "username": "nonexistent"
    })
    assert response.status_code == 404


def test_account_activation(client):
    headers_for_admin = get_auth_tokens(
        client, username="admin", password="admin")

    response = client.put("api/account-activation", headers=headers_for_admin)
    assert response.status_code == 400

    response = client.put("api/account-activation",
                          headers=headers_for_admin, json={})
    assert response.status_code == 400

    response = client.put("api/account-activation", headers=headers_for_admin, json={
        "host": "local",
        "username": "existent",
        "activation": "disable"
    })
    assert response.status_code == 200

    response = client.put("api/account-activation", headers=headers_for_admin, json={
        "host": "local",
        "username": "existent",
        "activation": "disable"
    })
    assert response.status_code == 400

    response = client.put("api/account-activation", headers=headers_for_admin, json={
        "host": "local",
        "username": "existent",
        "activation": "active"
    })
    assert response.status_code == 200

    response = client.put("api/account-activation", headers=headers_for_admin, json={
        "host": "local",
        "username": "existent",
        "activation": "active"
    })
    assert response.status_code == 400

    response = client.put("api/account-activation", headers=headers_for_admin, json={
        "host": "local",
        "username": "existent",
        "activation": "??"
    })
    assert response.status_code == 400

    response = client.put("api/account-activation", headers=headers_for_admin, json={
        "host": "local",
        "username": "nonexistent",
        "activation": "disable"
    })
    assert response.status_code == 404


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

    data["id"] = "TestCommunity4"
    data["admin"] = "nonexistent"
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
        'about': None,
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
        "id": "TestCommunity",
        "external": None
    })
    assert response.status_code == 200

    user_details = client.get("api/get-user", headers=headers).json
    assert len(user_details["subscriptions"]) == 1

    response = client.post("api/unsubscribe", headers=headers, json={
        "id": "TestCommunity",
        "external": None
    })
    assert response.status_code == 200

    user_details = client.get("api/get-user", headers=headers).json
    assert len(user_details["subscriptions"]) == 0

    response = client.post("api/unsubscribe", headers=headers, json={
        "id": "TestCommunity",
        "external": None
    })
    assert response.status_code == 200


def test_instance_management(client):
    response = client.get("api/get-instances")
    assert response.status_code == 200

    n = len(response.json)
    data = {
        "host": "Test",
        "url": "test.com"
    }

    response = client.post("api/add-instance", json=data)
    assert response.status_code == 200

    response = client.post("api/add-instance", json=data)
    assert response.status_code == 400

    response = client.get("api/get-instances")
    assert len(response.json) == n + 1


def test_delete_account(client):
    headers = get_auth_tokens(client)

    response = client.post("api/delete-account", headers=headers, json={
        "password": "incorrect password"
    })
    assert response.status_code == 401

    response = client.post("api/delete-account", headers=headers, json={
        "password": "1234"
    })
    assert response.status_code == 200

    response = client.get("api/get-user", headers=headers)
    assert response.status_code == 401


def test_voting(client):
    headers = get_auth_tokens(client)

    response = client.get(
        f"api/post-vote/{Constants.POST1_ID}?vote=upvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-vote/{Constants.POST1_ID}", headers=headers)
    assert response.json["vote"] == "upvote"

    response = client.get(
        f"api/post-vote/{Constants.POST1_ID}?vote=upvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-vote/{Constants.POST1_ID}", headers=headers)
    assert response.json["vote"] == "none"

    response = client.get(
        f"api/post-vote/{Constants.POST1_ID}?vote=downvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-vote/{Constants.POST1_ID}", headers=headers)
    assert response.json["vote"] == "downvote"

    response = client.get(
        f"api/post-vote/{Constants.POST1_ID}?vote=downvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-vote/{Constants.POST1_ID}", headers=headers)
    assert response.json["vote"] == "none"

    response = client.get(
        f"api/post-vote/{Constants.POST1_ID}?vote=downvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-vote/{Constants.POST1_ID}", headers=headers)
    assert response.json["vote"] == "downvote"

    response = client.get(
        f"api/post-vote/{Constants.POST1_ID}?vote=upvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-vote/{Constants.POST1_ID}", headers=headers)
    assert response.json["vote"] == "upvote"

    response = client.get(
        f"api/post-vote/{Constants.POST2_ID}?vote=downvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/post-vote/{Constants.POST2_ID}?vote=upvote", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/post-vote/{Constants.POST2_ID}?vote=downvote", headers=headers)
    assert response.status_code == 200


def test_post_tags(client):
    headers = get_auth_tokens(client)
    response = client.get(
        f"api/get-post-tags/{Constants.POST1_ID}", headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 0

    response = client.post(
        f"api/add-post-tag/{Constants.POST1_ID}?tag=cool", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-post-tags/{Constants.POST1_ID}", headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 1

    response = client.delete(
        f"api/delete-post-tag/{Constants.POST1_ID}?tag=cool", headers=headers)
    assert response.status_code == 200

    response = client.get(
        f"api/get-post-tags/{Constants.POST1_ID}", headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 0

    response = client.get(
        f"api/get-post-tags/{Constants.FAKE_POST_ID}", headers=headers)
    assert response.status_code == 404

    response = client.post(
        f"api/add-post-tag/{Constants.FAKE_POST_ID}?tag=cool", headers=headers)
    assert response.status_code == 404

    response = client.delete(
        f"api/delete-post-tag/{Constants.FAKE_POST_ID}?tag=cool", headers=headers)
    assert response.status_code == 404


def test_security(client):
    response = client.get("api/users")
    assert response.status_code == 200

    response = client.get("api/toggle-security")
    assert response.status_code == 200

    response = client.get("api/users")
    assert response.status_code == 400
    assert response.json["message"] == "Signature Missing"
