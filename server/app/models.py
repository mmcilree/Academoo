from sqlalchemy.orm import backref
from app import db
from datetime import datetime

Administrating = db.Table('Administrating',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )

class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)
    posts_created = db.relationship('Post', backref='author')
    host = db.Column(db.String, nullable=False)
    admin_of = db.relationship('Community', secondary=Administrating, backref='admins')

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.user_id

class Community(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.String(1000))
    posts = db.relationship('Post', backref='community')
    administrators = db.relationship("User", secondary=Administrating, backref='communities')

class Post(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String())
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'))
    content_type = db.Column(db.String(50))
    body = db.Column(db.String(1000))

    # NOTE: This can be community ID or post ID no?
    parent_id = db.Column(db.Integer, db.ForeignKey('post.id'))

    # NOTE: Perhaps we can use datetime data type here and use default value of time now whenever it's created?
    created = db.Column(db.BigInteger)
    
    modified = db.Column(db.BigInteger)

    # NOTE: Circular relationship is causing issues. Is this necessary?
    # comments = db.relationship('Post', backref='parent')

    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'))

