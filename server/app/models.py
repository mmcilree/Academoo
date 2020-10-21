from app import db
from datetime import datetime

class User(db.Model):
    user_id = db.Column(db.String(50), primary_key=True)
    posts = db.relationship('Post', backref='author')
    server_id = db.Column(db.Integer, nullable=False)

class Community(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(1000))
    sub_communities = db.relationship('SubCommunity', backref='parent')

class SubCommunity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(1000))
    parent_id = db.Column(db.Integer, db.ForeignKey('community.id'))

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50))
    author_id = db.Column(db.String(50), db.ForeignKey('user.id'))
    body = db.Column(db.String(1000))
    parent_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    comments = db.relationship('Post', backref='parent')
    #Created = 

