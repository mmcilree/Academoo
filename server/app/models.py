from sqlalchemy.orm import backref
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import time
import uuid

def getUUID():
    return str(uuid.uuid4())

def getTime():
    return int(datetime.utcnow().timestamp())

community_administrators = db.Table('community_administrators',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )

community_guests = db.Table('community_guests',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )

class User(db.Model):
    __tablename__ = 'user'

    user_id = db.Column(db.String(50), primary_key=True)
    posts_created = db.relationship('Post', backref='author')
    host = db.Column(db.String(1000), nullable=False)
    email = db.Column(db.String(1000))
    password_hash = db.Column(db.String(128))
    admin_of = db.relationship('Community', secondary=community_administrators, backref='admins')
    guest_of = db.relationship('Community', secondary=community_guests, backref='guests')

    @property
    def rolenames(self):
        try:
            return self.admin_of.split(',')
        except Exception:
            return []

    # Replace with switch statement for the different roles
    def has_role(self, community_id, role):
        print(community_id)
        print(self.admin_communities)
        role_communities = []
        
        if role == "admin":
            role_communities = self.admin_communities
        elif role == "guest":
            role_communities = self.guest_communities
               
        for community in role_communities:
            if community.id == community_id:
                return True
        return False

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(user_id=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.user_id
    
    @property
    def password(self):
        return self.password_hash

class Community(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.String(1000))
    posts = db.relationship('Post', backref='community')
    administrators = db.relationship("User", secondary=community_administrators, backref='admin_communities')
    guests = db.relationship("User", secondary=community_guests, backref='guest_communities')


class Post(db.Model):
    id = db.Column(db.String(1000), primary_key=True, default=getUUID)
    title = db.Column(db.String(1000))
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'))
    content_type = db.Column(db.String(50))
    body = db.Column(db.String(1000))
    created = db.Column(db.BigInteger, default=getTime)
    modified = db.Column(db.BigInteger, default=getTime, onupdate=getTime)
    parent_id = db.Column(db.String(1000), db.ForeignKey('post.id'))
    parent = db.relationship('Post', remote_side=[id], backref='comments')
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'))