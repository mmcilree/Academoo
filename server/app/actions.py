from app import db, guard
from app.models import User, Community, Post, getTime
from sqlalchemy import desc
import json
from uuid import UUID
import re

# NOTE: Should move to utils.py later when we refactor the code
def isUUID(val):
    try:
        UUID(val)
        return True
    except ValueError:
        return False

def createCommunity(community_id, title, description, admins):
    if Community.query.filter_by(id=community_id) is not None:
        return (400, {"title": "Community already exists", "message": "Please pick another community id that is not taken by an existing community"})
    
    community = Community(id=id, title=title, description=description)
    db.session.add(community)

    db.session.commit()

    for admin in admins:
        if not newSubscription(admin, id, "admin"):
            return False

    return True

def newSubscription(username, community_id, role="member"):
    user = User.query.filter_by(user_id = username).first()
    if user == None:
        return False
    
    if Subscription.query.filter_by(user_id=username, id=community_id) is None:
        new_sub = Subscription(user_id=username, community_id=community_id, role=role)
        db.session.add(new_sub)
        db.session.commit()
        return True

def setDefaultRole(default_role, community_id):
    community = Community.query.filter_by(id=community_id).first()
    community.default_role = default_role
    db.session.commit()
    return True

def getDefaultRole(community_id):
    community = Community.query.filter_by(id = community_id).first()
    community_dict = {"default_role": community.default_role}
    return community_dict

def assignRole(host, user_id, community_id, role):
    sub = Subscription.query.filter_by(user_id=user_id, community_id=community_id)
    if sub == None:
        return False
    sub.role = role
    db.session.commit()
    return True

def createUser(username, email, password):
    if db.session.query(User).filter_by(user_id=username).count() < 1 and db.session.query(User).filter_by(email=email).count() < 1:
        db.session.add(User(
            user_id=username,
            email=email,
            password_hash=guard.hash_password(password),
            host="Academoo",
        ))
        db.session.commit()

        return True
    
    return False

def getUserIDs():
    ids = [user.user_id for user in User.query.all()]
    return ids

def getUser(user_id):
    user = User.query.filter_by(user_id = user_id).first()
    user_dict = {"id": user.user_id, "posts": []}
    return user_dict

def getRoles(community_id):
    community = Community.query.filter_by(id=community_id).first()

    user_dict = {
        "admins": [user.user_id for user in community.admins()],
        "contributors": [user.user_id for user in community.contributors()],
        "members": [user.user_id for user in community.members()],
        "guests": [user.user_id for user in community.guests()],
        "prohibited": [user.user_id for user in community.prohibited()]
    }
    return user_dict


def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return (200, ids)

def getCommunity(community_id):
    if not re.match("<^[a-zA-Z0-9-_]{1,24}$>", community_id):
        return (400, {"title": "Invalid community id", "message": "community id does not match expected pattern <^[a-zA-Z0-9-_]{1,24}$>"})
    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return (404, {"title": "Could not find community", "message": "Community does not exist on database, use a different community id"})
    
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins()]}
    return (200, community_dict)

def getAllCommunityPostsTimeModified(community_id):
    # NOTE: shouldn't this return for all posts? Also, when we add comments to a post, then that parent post should have modified time updated as well?
    if not re.match("<^[a-zA-Z0-9-_]{1,24}$>", community_id):
        return (400, {"title": "Invalid community id", "message": "community id does not match expected pattern <^[a-zA-Z0-9-_]{1,24}$>"})
    if Community.query.filter_by(id = community_id).first() is None:
        return (404, {"title": "Could not find community", "message": "Community does not exist on database, use a different community id"})

    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community_id = community_id)]
    return (200, post_dicts)

def getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type):
    if community_id:
        is_comment = isUUID(community_id)

        if is_comment:
            posts = Post.query.filter(Post.created >= min_date, Post.parent_id == community_id).order_by(desc(Post.created)).limit(limit)
        else:
            posts = Post.query.filter(Post.created >= min_date, Post.community_id == community_id).order_by(desc(Post.created)).limit(limit)
    else:
        posts = Post.query.filter(Post.created >= min_date).order_by(desc(Post.created)).limit(limit)
    
    post_dicts = [{"id": post.id, "parent": post.parent_id if post.parent_id else post.community_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": post.author.user_id if post.author else "Guest", "host": post.author.host if post.author else "Narnia"}, "modified": post.modified, "created": post.created} for post in posts]
    return post_dicts

def createPost(post_data):
    post_parent = post_data["parent"]
    is_comment = isUUID(post_parent)
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
    
    if is_comment:
        post = Post(title=post_title, author_id=author_id, content_type=post_content_type, body=post_body, parent_id=post_parent)

        parentPost = Post.query.filter_by(id=post_parent).first()
        parentPost.modified = getTime()
    else:
        post = Post(title=post_title, author_id=author_id, content_type=post_content_type, body=post_body, community_id=post_parent)

    db.session.add(post)
    db.session.commit()
        

def getPost(post_id):
    post = Post.query.filter_by(id = post_id).first()    
    post_dict = {"id": post.id, "parent": post.parent_id if post.parent_id else post.community_id, "children": [comment.id for comment in post.comments], "title": post.title, "contentType": post.content_type, "body": post.body, "author": {"id": post.author.user_id, "host": post.author.host}, "modified": post.modified, "created": post.created}

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

def changePassword(username, old_password, new_password):
    user = guard.authenticate(username, old_password)
    print(user)
    if user:
        user.password_hash = guard.hash_password(new_password)
        db.session.commit()
        return True
    
    return False
