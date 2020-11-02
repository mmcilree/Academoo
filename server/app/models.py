from app import db
from datetime import datetime

administrating = db.Table('administrating',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.Integer, db.ForeignKey('community.id'))
    )

class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)
    posts_created = db.relationship('Post', backref='author')
    host = db.Column(db.String, nullable=False)
    admin_of = db.relationship('Community', secondary=administrating, back_ref='admins')

class Community(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.String(1000))
    posts = db.relationship('Post', back_ref='community')

class Post(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String())
    author_id = db.Column(db.String(50), db.ForeignKey('user.id'))
    content_type = db.Column(db.String(50))
    body = db.Column(db.String(1000))
    parent_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    created = db.Column(db.BigInteger)
    modified = db.Column(db.BigInteger)
    comments = db.relationship('Post', backref='parent')
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'))

