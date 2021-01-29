from sqlalchemy.ext.declarative.api import instrument_declarative
from sqlalchemy.orm import backref
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import time
import uuid
import enum

def getUUID():
    return str(uuid.uuid4())

def getTime():
    return int(datetime.utcnow().timestamp())

'''
administrating = db.Table('administrating',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )
'''

class UserRole(db.Model):
    user_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), primary_key=True)
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'), primary_key=True)
    role = db.Column(db.String(50)) # admin, contributor, member, guest, prohibited

class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)
    posts_created = db.relationship('Post', backref='author')
    host = db.Column(db.String(1000), nullable=False)
    email = db.Column(db.String(1000))
    password_hash = db.Column(db.String(128))
    #admin_of = db.relationship('Community', secondary=administrating, backref='admins')
    roles = db.relationship('UserRole', backref='user')

    '''
    @property
    def rolenames(self):
        try:
            return self.admin_of.split(',')
        except Exception:
            return []   

    def has_no_role(self, community_id):
        role_communities = []
        role_communities.append(self.admin_communities)
        role_communities.append(self.contributor_communities)
        role_communities.append(self.member_communities)
        role_communities.append(self.guest_communities)
        role_communities.append(self.prohibited_communities)

        for list in role_communities:
            for community in list:
                if community.id == community_id:
                    return False
        return True
    '''

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
    
    def has_role(self, community_id, role):
        role_tiers = {"admin": 1, "contributor": 2, "member": 3, "guest": 4, "prohibited": 5}
        entry = UserRole.query.filter_by(user_id=user_id, community_id=community_id).first()
        if entry is None or role_tiers[entry.role] > role_tiers[role]:
            return False
        return True

class Community(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.String(1000))
    posts = db.relationship('Post', backref='community')
    #administrators = db.relationship("User", secondary=administrating, backref='communities')
    roles_granted = db.relationship('UserRole', backref='community')
    default_role = db.Column(db.String(50), default="contributor", nullable=False)

    def admins(self):
        pairs = UserRole.join(User, UserRole.user_id == User.user_id).filter_by(community_id=id, role="admin")
        admins = [pair[0] for pair in pairs]
        return admins

    def contributors(self):
        pairs = UserRole.join(User, UserRole.user_id == User.user_id).filter_by(community_id=id, role="contributor")
        contributors = [pair[0] for pair in pairs]
        return contributors

    def members(self):
        pairs = UserRole.join(User, UserRole.user_id == User.user_id).filter_by(community_id=id, role="member")
        members = [pair[0] for pair in pairs]
        return members

    def guests(self):
        pairs = UserRole.join(User, UserRole.user_id == User.user_id).filter_by(community_id=id, role="guest")
        guests = [pair[0] for pair in pairs]
        return guests

    def prohibited(self):
        pairs = UserRole.join(User, UserRole.user_id == User.user_id).filter_by(community_id=id, role="prohibited")
        prohibited = [pair[0] for pair in pairs]
        return prohibited

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
    host = db.Column(db.String(50), nullable=False)

''' Will probably be needed when posts can support more than just text :(
class PostContent(db.Model):
    post_id = db.Column(db.String(1000), db.ForeignKey('post.id'))
'''