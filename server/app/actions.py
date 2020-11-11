from app import db, guard
from app.models import User, Community, Post
from sqlalchemy import desc
import json
from uuid import UUID
import re

def createCommunity(id, title, description, admins):
    community = Community(id=id, title=title, description=description)
    db.session.add(community)

    db.session.commit()

    # TODO: link admins to the community

    return True

def createUser(email, password):
    if db.session.query(User).filter_by(email=email).count() < 1:
        db.session.add(User(
          email=email,
          password_hash=guard.hash_password(password),
          host="Academoo",
        ))
        db.session.commit()

        return True
    
    return False

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
    is_comment = not re.match("$^[a-zA-Z0-9-_]{1,24}$", community_id)

    if is_comment:
        posts = Post.query.filter(Post.created >= min_date, Post.parent_id == community_id).order_by(desc(Post.created)).limit(limit)
    else:
        posts = Post.query.filter(Post.created >= min_date, Post.community_id == community_id).order_by(desc(Post.created)).limit(limit)
    
    post_dicts = [{"id": post.id, "parent": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": post.author.email if post.author else "Guest", "host": post.author.host if post.author else "Narnia"}, "modified": post.modified, "created": post.created} for post in posts]
    return post_dicts

def createPost(post_data):
    post_parent = post_data["parent"]
    is_comment = not re.match("$^[a-zA-Z0-9-_]{1,24}$", post_parent)
    post_title = post_data["title"]
    post_content_type = post_data["contentType"]
    post_body = post_data["body"]
    author_dict = post_data["author"]
    author_id = author_dict["id"]
    author_host = author_dict["host"]

    if not User.query.filter_by(user_id = author_id).scalar():
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
        post_dict = {"id": post.id, "parent": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": post.author.email, "host": post.author.host}, "modified": post.modified, "created": post.created}
    else:
        post_dict = {"id": post.id, "parent": post.community_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": post.author.email, "host": post.author.host}, "modified": post.modified, "created": post.created}

    return post_dict

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