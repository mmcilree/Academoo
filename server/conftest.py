import pytest
from app import create_app, db, guard
from app.models import User, Community, Post

class Constants(object):
    POST1_ID = "dafca76d-5883-4eff-959a-d32bc9f72e1a"
    POST2_ID = "5ab3acce-e9d1-4b3a-be97-60d2cbe32a4c"
    FAKE_POST_ID = "b78b29f4-88d2-4500-b3f9-704449b262e2"

class TestConfig(object):
    TESTING = True
    SECRET_KEY = "testing-is-so-much-fun"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    PUBLIC_KEY = "PKEY"
    SIGNATURE_FEATURE = False

    JWT_ACCESS_LIFESPAN = {'hours': 24}
    JWT_REFRESH_LIFESPAN = {'days': 30}
    HOST = "cs3099user-a1.host.cs.st-andrews.ac.uk"

def get_auth_tokens(client, username="existent", password="1234"):
    response = client.post("api/login", json = {
        "username": username,
        "password": password
    })

    headers = {
        "Authorization": f"Bearer {response.json.get('access_token')}"
    }

    return headers

def setup_db():
    admin_user = User(user_id="admin", host="test.com", password_hash=guard.hash_password("admin"), site_roles="site-admin", private_account=True)
    test_user = User(user_id="existent", host="test.com", password_hash=guard.hash_password("1234"))
    test_user2 = User(user_id="TestUser2", host="test.com", password_hash=guard.hash_password("1234"))

    community1 = Community(
        id="TestCommunity", 
        title="Test Community",
    )
    community2 = Community(
        id="TestCommunity2", 
        title="Test Community 2",
    )

    post1 = Post(
        id=Constants.POST1_ID, 
        title="Post 1", 
        modified=0, 
        author=test_user, 
        community=community1,
    )
    post2 = Post(
        id=Constants.POST2_ID, 
        title="Post 2", 
        modified=1, 
        author=test_user,
        community=community1,
    )
    
    db.session.add(admin_user)
    db.session.add(test_user)
    db.session.add(test_user2)

    db.session.add(community1)
    db.session.add(community2)

    db.session.add(post1)
    db.session.add(post2)
    db.session.commit()

@pytest.fixture
def app():
    app = create_app(TestConfig)

    context = app.app_context()
    context.push()
    db.create_all()

    setup_db()

    yield app

    db.session.remove()
    db.drop_all()
    context.pop()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()