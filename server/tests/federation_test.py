import pytest
from conftest import Constants

headers = {
    "Client-Host": "localhost:5000"
}

headers_with_user = dict(headers, **{"User-ID": "existent"})


def test_get_communities(client, requests_mock):
    requests_mock.get(
        "https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/communities", json=[])

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
    requests_mock.get(
        "https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/communities/BadJSON", json={})

    response = client.get(
        "api/communities/TestCommunity?external=academoo", headers=headers)
    assert response.status_code == 200

    response = client.get("api/communities/TestCommunity?external=academoo")
    assert response.status_code == 400

    response = client.get(
        "api/communities/BadJSON?external=academoo", headers=headers)
    assert response.status_code == 400


def test_get_posts(client, requests_mock):
    requests_mock.get(
        "https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts", json={})
    requests_mock.get(
        "https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/communities/TestCommunity/timestamps", json=[])

    response = client.get(
        "api/posts?community=TestCommunity&external=academoo", headers=headers_with_user)
    assert response.status_code == 400

    requests_mock.get(
        "https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts", json=[])
    response = client.get(
        "api/posts?community=TestCommunity&external=academoo", headers=headers_with_user)
    assert response.status_code == 200


def test_create_posts(client, requests_mock):
    requests_mock.post("https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts", status_code=201, json={
        "community": "sailing",
        "parentPost": "dafca76d-5883-4eff-959a-d32bc9f72e1a",
        "title": "Bezos's Wealth Overflows 64-bit Unsigned Integer, Is Now Homeless",
        "content": [
            {
                "text": {
                    "text": "Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit amet consectetur adipisci[ng]velit, sed quia non-numquam [do] eius modi tempora inci[di]dunt, ut labore et dolore magnam aliquam quaerat voluptatem."
                }
            }
        ]
    })

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
    requests_mock.get(
        f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts/{Constants.POST1_ID}", json={})
    response = client.get(
        f"api/posts/{Constants.POST1_ID}?external=academoo", headers=headers_with_user)
    assert response.status_code == 400

    requests_mock.get(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts/{Constants.POST1_ID}", json={
        "id": "5ab3acce-e9d1-4b3a-be97-60d2cbe32a4c",
        "community": "sailing",
        "parentPost": "dafca76d-5883-4eff-959a-d32bc9f72e1a",
        "children": [
            "b78b29f4-88d2-4500-b3f9-704449b262e2",
            "53da9025-0ba3-4966-8703-824c7418172a",
            "d2073b6a-3115-4089-b198-6db799bc53ad"
        ],
        "title": "Bezos's Wealth Overflows 64-bit Signed Integer, Now Massively In Debt",
        "content": [
            {
                "text": {
                    "text": "Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit amet consectetur adipisci[ng]velit, sed quia non-numquam [do] eius modi tempora inci[di]dunt, ut labore et dolore magnam aliquam quaerat voluptatem."
                }
            }
        ],
        "author": {
            "id": "coolusername123",
            "host": "cooldomain.edu"
        },
        "modified": 1552832552,
        "created": 1552832584
    })
    response = client.get(
        f"api/posts/{Constants.POST1_ID}?external=academoo", headers=headers_with_user)
    assert response.status_code == 200

    response = client.get(f"api/posts/{Constants.POST1_ID}?external=academoo")
    assert response.status_code == 400


def test_edit_post(client, requests_mock):
    requests_mock.put(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts/{Constants.POST1_ID}", json=
        {
            "title": "Post Title",
            "content": [
                {
                    "text": {
                        "text": "Cool"
                    }
                }
            ]
        }
    )

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

    response = client.put(
        f"api/posts/{Constants.POST1_ID}", json=data, headers=headers_with_user)
    assert response.status_code == 200

    response = client.put(f"api/posts/{Constants.POST1_ID}", json=data)
    assert response.status_code == 400

    response = client.put(
        f"api/posts/{Constants.POST1_ID}", headers=headers_with_user)
    assert response.status_code == 400


def test_delete_post(client, requests_mock):
    requests_mock.delete(
        f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/posts/{Constants.POST1_ID}", status_code=200)
    response = client.delete(
        f"api/posts/{Constants.POST1_ID}", headers=headers_with_user, json={"external": "academoo"})
    assert response.status_code == 200

    response = client.delete(
        f"api/posts/{Constants.POST1_ID}", json={"external": "academoo"})
    assert response.status_code == 400


def test_get_users(client, requests_mock):
    requests_mock.get(
        f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/users", json=[])

    response = client.get("api/users?external=academoo")
    assert response.status_code == 200
    assert len(response.json) == 0


def test_get_users_by_id(client, requests_mock):
    requests_mock.get(
        f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/users/existent", json={})

    response = client.get("api/users/existent?external=academoo")
    assert response.status_code == 400

    requests_mock.get(f"https://cs3099user-a1.host.cs.st-andrews.ac.uk/fed/users/existent", json={
        "id": "john",
        "about": "A place for a user to write an about / bio",
        "avatarUrl": "cooldomain.edu/media/profile_imgs/avatar.png",
        "posts": [
            {
                "id": "5ab3acce-e9d1-4b3a-be97-60d2cbe32a4c",
                "host": "cooldomain.edu"
            }
        ]
    }
    )

    response = client.get("api/users/existent?external=academoo")
    assert response.status_code == 200
