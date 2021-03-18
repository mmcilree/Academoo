import pytest
from app import create_app, db
from app.models import User, Community, Post

class TestConfig(object):
    TESTING = True
    SECRET_KEY = "testing-is-so-much-fun"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

def setup_db():
    test_user = User(user_id="existent", host="test.com")

    community1 = Community(
        id="TestCommunity", 
        title="Test Community",
    )
    community2 = Community(
        id="TestCommunity2", 
        title="Test Community 2",
    )

    post1 = Post(
        id="dafca76d-5883-4eff-959a-d32bc9f72e1a", 
        title="Post 1", 
        modified=0, 
        author=test_user, 
        community=community1,
    )
    post2 = Post(
        id="5ab3acce-e9d1-4b3a-be97-60d2cbe32a4c", 
        title="Post 2", 
        modified=1, 
        author=test_user,
        community=community1,
    )

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