from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import unittest
from app import create_app, db
from app.models import *
import uuid

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    ELASTICSEARCH_URL = None

class DBCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_user_posts_created(self):
        u = User(user_id='arnold06', host='test.com')
        db.session.add(u)
        db.session.commit()
        self.assertEqual(u.posts_created, [])

        p1 = Post(title='Arnolds 1st Post', author=u)
        p2 = Post(title='Arnolds 2nd Post', author=u)
        db.session.add(p1)
        db.session.add(p2)
        db.session.commit()
        self.assertEqual(u.posts_created, [p1, p2])

    def test_community_posts(self):
        c = Community(id='testCom', title='test community')
        db.session.add(c)
        db.session.commit()
        self.assertEqual(c.posts, [])

        p1 = Post(title='test post', community=c)
        p2 = Post(title='test post', community=c)
        db.session.add(p1)
        db.session.add(p2)
        db.session.commit()
        self.assertEqual(c.posts, [p1, p2])

    def test_community_roles(self):
        c = Community(id='testCom', title='test community')
        db.session.add(c)
        db.session.commit()
        self.assertEqual(c.roles_granted, [])

        u1 = User(user_id='bob09', host='test.com')
        u2 = User(user_id='jon01', host='test.com')
        db.session.add(u1)
        db.session.add(u2)
        db.session.commit()
        u1_role = UserRole(user_id='bob09', community_id='testCom', role='admin')
        u2_role = UserRole(user_id='jon01', community_id='testCom', role='contributor')
        db.session.add(u1_role)
        db.session.add(u2_role)
        db.session.commit()
        print(str(c.roles_granted))
        c.roles_granted.append(u1_role)
        c.roles_granted.append(u2_role)
        print(str(c.roles_granted))
        self.assertTrue(set([u1_role, u2_role]).issubset(c.roles_granted))
        self.assertEqual(u1.roles, [u1_role])
        self.assertEqual(u2.roles, [u2_role])

    def test_post_uuid(self):
        p = Post(title='test post')
        db.session.add(p)
        db.session.commit()
        uuid.UUID(p.id, version=4)

    def test_post_author(self):
        u = User(user_id='bob09', host='test.com')
        db.session.add(u)
        db.session.commit()

        p = Post(title='test post', author=u)
        db.session.add(p)
        db.session.commit()
        self.assertEqual(p.author, u)

    def test_post_created(self):
        p = Post(title='test post')
        db.session.add(p)
        db.session.commit()
        self.assertIsInstance(p.created, int)

    def test_post_modified(self):
        p = Post(title='test post')
        db.session.add(p)
        db.session.commit()
        before = p.created
        time.sleep(1)
        p.title = 'test post modified'
        db.session.commit()
        after = p.modified
        self.assertTrue(before < after)
    
    def test_post_community(self):
        c = Community(id='testCom', title='test community')
        db.session.add(c)
        db.session.commit()
        self.assertEqual(c.posts, [])

        p = Post(title='test post', community=c)
        db.session.add(p)
        db.session.commit()
        self.assertEqual(p.community, c)

    def test_comment_parent(self):
        p1 = Post(title='test post')
        db.session.add(p1)
        db.session.commit()
        p2 = Post(title='test post', parent=p1)
        db.session.add(p2)
        db.session.commit()
        self.assertEqual(p1.comments, [p2])
        self.assertEqual(p2.parent, p1)


if __name__ == '__main__':
    unittest.main(verbosity=2)