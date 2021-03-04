from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import unittest
from app import create_app, db
from app.models import User, Post, Community
import uuid
import time

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

    #def test_user_password(self):
     #   pass

    #def test_user_uuid(self):
     #   pass

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

    def test_user_admin_of(self):
        u = User(user_id='bob09', host='test.com')
        db.session.add(u)
        db.session.commit()
        self.assertEqual(u.admin_of, [])

        c = Community(id='testCom', title='test community')
        db.session.add(c)
        u.admin_of.append(c)
        db.session.commit()
        self.assertEqual(u.admin_of, [c])
        self.assertEqual(c.admins, [u])

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

    def test_community_admins(self):
        c = Community(id='testCom', title='test community')
        db.session.add(c)
        db.session.commit()
        self.assertEqual(c.admins, [])

        u1 = User(user_id='bob09', host='test.com')
        u2 = User(user_id='jon01', host='test.com')
        db.session.add(u1)
        db.session.add(u2)
        db.session.commit()
        c.admins.append(u1)
        c.admins.append(u2)
        self.assertEqual(c.admins, [u1, u2])
        self.assertEqual(u1.admin_of, [c])
        self.assertEqual(u2.admin_of, [c])

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
        self.assertEquals(p.author, u)

    def test_post_created(self):
        p = Post(title='test post')
        db.session.add(p)
        db.session.commit()
        self.assertIsInstance(p.created, int)

    """
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
    """

    def test_post_community(self):
        c = Community(id='testCom', title='test community')
        db.session.add(c)
        db.session.commit()
        self.assertEqual(c.posts, [])

        p = Post(title='test post', community=c)
        db.session.add(p)
        db.session.commit()
        self.assertEquals(p.community, c)

    def test_comment_parent(self):
        p1 = Post(title='test post')
        db.session.add(p1)
        db.session.commit()
        p2 = Post(title='test post', parent=p1)
        db.session.add(p2)
        db.session.commit()
        self.assertEquals(p1.comments, [p2])
        self.assertEquals(p2.parent, p1)


if __name__ == '__main__':
    unittest.main(verbosity=2)