from app import db
from app.models import User, Community, Post
import json
from uuid import UUID
import re

def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return ids

def getCommunity(community_id):
    community = Community.query.filter_by(id = community_id).first()
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins]}
    return community_dict

def getAllCommunityPostsTimeModified(community_id):
    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community = community_id)]
    return post_dicts

def getFilteredPosts(limit, community_id, min_date):
    posts = Post.query.filter(Post.created >= min_date, Post.community == community_id).limit(limit)
    post_dicts = [{"id": post.id, "parent": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": "no exist ! post.admin.id", "host": "no exist ! post.admin.host"}, "modified": post.modified, "created": post.created} for post in posts]
    return post_dicts

def createPost(post_data):
    post_parent = post_data["parent"]
    is_comment = True
    if re.match("$^[a-zA-Z0-9-_]{1,24}$", post_parent):
        is_comment = False
    post_title = post_data["title"]
    post_content_type = post_data["contentType"]
    post_body = post_data["body"]
    author_dict = post_data["author"]
    author_id = author_dict["id"]
    author_host = author_dict["host"]

    if User.query.filter_by(user_id = author_id).scalar() is not None:
        user = User(user_id = author_id, host = author_host)
        db.session.add(user)
        db.session.commit()
    
    post_author = User.query.filter_by(user_id = author_id).first()

    if is_comment:
        post = Post(title=post_title, author_id=author_id, content_type=post_content_type, body=post_body, parent_id=post_parent)
    else:
        post = Post(title=post_title, author_id=author_id, content_type=post_content_type, body=post_body, community_id=post_parent)

    db.session.add(post)
    db.session.commit()
        

def getPost(post_id):
    post = Post.query.filter_by(id = post_id).first()
    is_comment = True
    if re.match("$^[a-zA-Z0-9-_]{1,24}$", post_id):
        is_comment = False

    if is_comment:
        post_dict = {"id": post.id, "parent": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": post.admin.id, "host": post.admin.host}, "modified": post.modified, "created": post.created}
    else:
        post_dict = {"id": post.id, "parent": post.community_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": post.admin.id, "host": post.admin.host}, "modified": post.modified, "created": post.created}

    return json.dumps(post_dict)

def editPost(post_id, post_data):
    update_title = post_data["title"]
    update_content_type = post_data["contentType"]
    update_body = post_data["body"]

    post = Post.query.filter_by(id = post_id)
    post.title = update_title
    post.content_type = update_content_type
    post.body = update_body
    db.session.commit()

def deletePost(post_id):
    post = Post.query.filter_by(id = post_id)
    db.session.delete(post)
    db.session.commit()