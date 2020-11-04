from sqlalchemy.orm import backref
from app import db
from datetime import datetime
from werkzeug import generate_password_hash, check_password_hash

Administrating = db.Table('Administrating',
    db.Column('user_id', db.String(50), db.ForeignKey('user.user_id')),
    db.Column('community_id', db.String(1000), db.ForeignKey('community.id'))
    )

class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)
    posts_created = db.relationship('Post', backref='author')
    # NOTE: May not need
    comments_created = db.relationship('Comment', backref='author')
    host = db.Column(db.String(1000), nullable=False)
    email = db.Column(db.String(1000))
    password_hash = db.Column(db.String(128))
    admin_of = db.relationship('Community', secondary=Administrating, backref='admins')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
class Community(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000), nullable=False)
    description = db.Column(db.String(1000))
    posts = db.relationship('Post', backref='community')
    administrators = db.relationship("User", secondary=Administrating, backref='communities')

class Post(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    title = db.Column(db.String(1000))
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'))
    content_type = db.Column(db.String(50))
    body = db.Column(db.String(1000))
    created = db.Column(db.DateTime, default=datetime.now)
    modified = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    parent_id = db.Column(db.Integer, db.ForeignKey('post.id'))

    comments = db.relationship('Comment', remote_side=id, backref='parent')
    community_id = db.Column(db.String(1000), db.ForeignKey('community.id'))


""" # didnt work so stuck with ugly Post table where community_id = null for comments
class Comment(db.Model):
    id = db.Column(db.String(1000), primary_key=True)
    author_id = db.Column(db.String(50), db.ForeignKey('user.user_id'))
    content_type = db.Column(db.String(50))
    body = db.Column(db.String(1000))
    created = db.Column(db.DateTime, default=datetime.now)
    modified = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    parent_comment_id = db.Column(db.String(1000), db.ForeignKey('comment.id'))
    child_comments = db.relationship('Comment', remote_side=id, backref='parent_comment')
    parent_post = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
""" 