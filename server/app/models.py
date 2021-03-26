from sqlalchemy.ext.declarative.api import instrument_declarative
from sqlalchemy.orm import backref
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import time
import uuid
import enum
import sqlalchemy.types as types

def getUUID():
    return str(uuid.uuid4())

def getTime():
    return int(datetime.utcnow().timestamp())

class UserRole(db.Model):
    user_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), primary_key=True)
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'), primary_key=True)
    role = db.Column(db.String(50)) # admin, contributor, member, guest, prohibited

subscriptions = db.Table('subscriptions',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id')))

class UserVote(db.Model):
    user_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), primary_key=True)
    post_id = db.Column(db.String(1000), db.ForeignKey('post.id'), primary_key=True)
    value = db.Column(db.String(50)) # upvote / downvote

class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)
    posts_created = db.relationship('Post', backref='author')
    host = db.Column(db.String(1000), nullable=False)
    email = db.Column(db.String(1000))
    bio = db.Column(db.String(140))
    private_account = db.Column(db.Boolean, default=False, nullable=False)
    password_hash = db.Column(db.String(128))
    site_roles = db.Column(db.String, default="basic")
    #admin_of = db.relationship('Community', secondary=administrating, backref='admins')
    subscriptions = db.relationship('Community', secondary=subscriptions, backref='subscribed_users')
    roles = db.relationship('UserRole', backref='user', cascade="all, delete")

    # We need this for auth to work apparently - maybe Robert can clarify?
    @property
    def rolenames(self):
        try:
            roles = self.site_roles.split(",")
            return roles
        except Exception:
            return []   

    '''
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
        role_tiers = {"admin": 1, "contributor": 2, "member": 3, "guest": 4}
        entry = UserRole.query.filter_by(user_id=self.identity, community_id=community_id).first()
        if entry is None:
            community  = Community.lookup(community_id)
            if(role == "prohibited"):
                if(community.default_role == role):
                    return True
                else:
                    return False
            if(role_tiers[community.default_role] <= role_tiers[role]):
                return True
            return False

        if(role == "prohibited"):
            if(entry.role == role):
                return True
            else:
                return False
        elif role_tiers[entry.role] > role_tiers[role]:
            return False
        return True

class Community(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.String(1000))
    posts = db.relationship('Post', backref='community')
    #administrators = db.relationship("User", secondary=administrating, backref='communities')
    subscribers = db.relationship("User", secondary=subscriptions, backref='subscribed_communities')
    roles_granted = db.relationship('UserRole', backref='community')
    default_role = db.Column(db.String(50), default="contributor", nullable=False)

    def admins(self):
        pairs = User.query.join(UserRole, UserRole.user_id == User.user_id).filter_by(community_id=self.id, role="admin")
        admins = [pair for pair in pairs]
        return admins

    def contributors(self):
        pairs = User.query.join(UserRole, UserRole.user_id == User.user_id).filter_by(community_id=self.id, role="contributor")
        contributors = [pair for pair in pairs]
        return contributors

    def members(self):
        pairs = User.query.join(UserRole, UserRole.user_id == User.user_id).filter_by(community_id=self.id, role="member")
        members = [pair for pair in pairs]
        return members

    def guests(self):
        pairs = User.query.join(UserRole, UserRole.user_id == User.user_id).filter_by(community_id=self.id, role="guest")
        guests = [pair for pair in pairs]
        return guests

    def prohibited(self):
        pairs = User.query.join(UserRole, UserRole.user_id == User.user_id).filter_by(community_id=self.id, role="prohibited")
        prohibited = [pair for pair in pairs]
        return prohibited
        
    @classmethod
    def lookup(cls, community_id):
        return cls.query.filter_by(id=community_id).one_or_none()

class Post(db.Model):
    id = db.Column(db.String(1000), primary_key=True, default=getUUID)
    title = db.Column(db.String(1000))
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'))
    content_objects = db.relationship('PostContentField', cascade="all,delete", backref='post')
    created = db.Column(db.BigInteger, default=getTime)
    modified = db.Column(db.BigInteger, default=getTime, onupdate=getTime)
    parent_id = db.Column(db.String(1000), db.ForeignKey('post.id'))
    upvotes = db.Column(db.Integer, default=0)
    downvotes = db.Column(db.Integer, default=0)
    parent = db.relationship('Post', remote_side=[id], backref='comments')
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'))
    tags = db.relationship('PostTag', backref='post', cascade="all, delete")

class PostTag(db.Model):
    post_id = db.Column(db.String(1000), db.ForeignKey('post.id'), primary_key=True)
    tag = db.Column(db.String(50), primary_key=True)

class PostContentField(db.Model):
    post_id = db.Column(db.String(1000), db.ForeignKey('post.id'), primary_key=True)
    content_type = db.Column(db.String(50), primary_key=True)
    json_object = db.Column(types.JSON())
