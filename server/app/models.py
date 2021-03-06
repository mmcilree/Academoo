from sqlalchemy.ext.declarative.api import instrument_declarative
from sqlalchemy.orm import backref
from app import db
from datetime import datetime
from datetime import timezone
from werkzeug.security import generate_password_hash, check_password_hash
import time
import uuid
import enum
import sqlalchemy.types as types

def getUUID():
    return str(uuid.uuid4())

def getTime():
    return int(datetime.now(tz=timezone.utc).timestamp())

# Table to hold roles given out by communities
class UserRole(db.Model): 
    user_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), primary_key=True)
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'), primary_key=True)
    role = db.Column(db.String(50))

# Table to hold site subscriptions
class UserSubscription(db.Model):
    user_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), primary_key=True)
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'), primary_key=True)
    external = db.Column(db.String(50))

subscriptions = db.Table('subscriptions', 
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id')))

# Table to hold a post vote instance
class UserVote(db.Model): 
    user_id = db.Column(db.String(50), db.ForeignKey('user.user_id'), primary_key=True)
    post_id = db.Column(db.String(1000), db.ForeignKey('post.id'), primary_key=True)
    value = db.Column(db.String(50)) # upvote / downvote

# Table to hold a user account
class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)
    posts_created = db.relationship('Post', backref='author')
    host = db.Column(db.String(1000), nullable=False)
    email = db.Column(db.String(1000))
    about = db.Column(db.String(140))
    private_account = db.Column(db.Boolean, default=False, nullable=False)
    password_hash = db.Column(db.String(128))
    site_roles = db.Column(db.String, default="basic")
    subscriptions = db.relationship('UserSubscription', backref='subscribed_users',  cascade="all, delete")
    roles = db.relationship('UserRole', backref='user', cascade="all, delete")

    # Lists all roles given to user
    @property
    def rolenames(self):
        try:
            roles = self.site_roles.split(",")
            return roles
        except Exception:
            return []

    # Convenience method to query user
    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(user_id=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    # Get user id
    @property
    def identity(self):
        return self.user_id
    
    # Return password hash of user
    @property
    def password(self):
        return self.password_hash
    
    # Check user has a specific role, True if yes, False if no
    def has_role(self, community_id, role):
        # Lower tier means higher access privilege
        role_tiers = {"admin": 1, "contributor": 2, "member": 3, "guest": 4}
        entry = UserRole.query.filter_by(user_id=self.identity, community_id=community_id).first()
        if entry is None:
            community  = Community.lookup(community_id)
            if(role == "prohibited"):
                if(community.default_role == role):
                    return True
                else:
                    return False
            if community.default_role == "prohibited":
                return False
            if((role_tiers[community.default_role] <= role_tiers[role])):
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

# Table to hold communities
class Community(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.String(1000))
    posts = db.relationship('Post', backref='community')
    subscribers = db.relationship("User", secondary=subscriptions, backref='subscribed_communities')
    roles_granted = db.relationship('UserRole', backref='community')
    default_role = db.Column(db.String(50), default="contributor", nullable=False)

    # Retrieves users that match a specific role in community
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
        
    # Convenience method for retreiving community
    @classmethod
    def lookup(cls, community_id):
        return cls.query.filter_by(id=community_id).one_or_none()

# Table to hold posts
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
    parent = db.relationship('Post', remote_side=[id], backref=backref('comments', cascade="all, delete-orphan"))
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'))
    tags = db.relationship('PostTag', backref='post', cascade="all, delete")

# Table to hold tags associated with posts
class PostTag(db.Model):
    post_id = db.Column(db.String(1000), db.ForeignKey('post.id'), primary_key=True)
    tag = db.Column(db.String(50), primary_key=True)

# Table to hold json that describes the content of a post
class PostContentField(db.Model):
    post_id = db.Column(db.String(1000), db.ForeignKey('post.id'), primary_key=True)
    content_type = db.Column(db.String(50), primary_key=True)
    json_object = db.Column(types.JSON())

    def __str__(self):
        if self.content_type == "poll":
            return f"{self.content_type} {self.json_object.get('question')}"
        else:
            return f"{self.content_type} {self.post.title} {self.json_object.get('text')}"
