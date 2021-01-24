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

community_contributors = db.Table('community_contributors',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )

community_members = db.Table('community_members',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )

community_guests = db.Table('community_guests',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )

community_prohibited = db.Table('community_prohibited',
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
    admin_of = db.relationship('Community', secondary=community_administrators, backref='admin_users')
    contributor_of = db.relationship('Community', secondary=community_contributors, backref='contributor_users')
    member_of = db.relationship('Community', secondary=community_members, backref='member_users')
    guest_of = db.relationship('Community', secondary=community_guests, backref='guest_users')
    prohibited_from = db.relationship('Community', secondary=community_prohibited, backref='prohibited_users')

    @property
    def rolenames(self):
        try:
            return self.admin_of.split(',')
        except Exception:
            return []

    
    def has_role(self, community_id, role):
        role_communities = []
        
        if role == "admin":
            role_communities.append(self.admin_communities)
        elif role == "contributor":
            role_communities.append(self.admin_communities)
            role_communities.append(self.contributor_communities)
        elif role == "member":
            role_communities.append(self.admin_communities)
            role_communities.append(self.contributor_communities)
            role_communities.append(self.member_communities)
        elif role == "guest":
            role_communities.append(self.admin_communities)
            role_communities.append(self.contributor_communities)
            role_communities.append(self.member_communities)
            role_communities.append(self.guest_communities)
        elif role == "prohibited":
            role_communities.append(self.prohibited_communities)

               
        for list in role_communities:
            for community in list:
                if community.id == community_id:
                    return True
        return False        

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
    contributors = db.relationship("User", secondary=community_contributors, backref='contributor_communities')
    members = db.relationship("User", secondary=community_members, backref='member_communities')
    guests = db.relationship("User", secondary=community_guests, backref='guest_communities')
    prohibited = db.relationship("User", secondary=community_prohibited, backref='prohibited_communities')
    default_role = db.Column(db.String(50), default="contributor", nullable=False)

    @classmethod
    def lookup(cls, id):
        return cls.query.filter_by(id=id).one_or_none()

    
    def get_default_role(self, id):
        return self.default_role
        # community = self.query.filter_by(id=id).one_or_none()
        # if(community != None):
        #     return community.default_role


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