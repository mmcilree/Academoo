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

def createCommunity(id, title, description, admin):
    community = Community(id=id, title=title, description=description)
    db.session.add(community)
    if(addAdmin(admin, id) == False):
        return False
    db.session.commit()
    return True

def addAdmin(username, community_id):
    user = db.session.query(User).filter_by(user_id=username).first()
    if(user == None):
        return False
    

    if not user.has_role(community_id, "admin"):
        community = db.session.query(Community).filter_by(id=community_id).first()
        community.admin_users.append(user)
        db.session.commit()
        return True

def setDefaultRole(default_role, community_id):
    community = db.session.query(Community).filter_by(id=community_id).first()
    community.default_role = default_role
    db.session.commit()
    return True


def getDefaultRole(community_id):
    community = Community.query.filter_by(id = community_id).first()
    community_dict = {"default_role": community.default_role}
    return community_dict

def assignRole(host, user_id, community_id, role):
    #TO-DO check if user already has a role in the community and update it?
    if(host == "local"):
        user = db.session.query(User).filter_by(user_id=user_id).first()
        community = db.session.query(Community).filter_by(id=community_id).first()

        # if (user.has_role(community_id, "guest") & user.has_role(community_id, "prohibitor")):
        #     for contrib in community.contributor_users:
        #         if user.user_id == contrib.user_id :
        #             db.session.delete(contrib)
        
        if role == "admin" :
            community.admin_users.append(user)
        elif role == "contributor" :
            community.contributor_users.append(user)
        elif role == "member" :
            community.member_users.append(user)
        elif role == "guest" :
            community.guest_users.append(user)
        elif role == "prohibited" :
            community.prohibited_users.append(user)
        else :
            return False

        db.session.commit()
        return True
    else:
        #TO-DO: implement assigning a role to an external user
        #(user_id should combine username and host)
        
        return False
  
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

def getUser(user_id):
    user = User.query.filter_by(user_id = user_id).first()
    user_dict = {"id": user.user_id, "posts": []}
    return user_dict

def getRoles(community_id):
    community = Community.query.filter_by(id = community_id).first()
    user_dict = {
        "admins": [admin.user_id for admin in community.admin_users],
        "contributors": [contributor.user_id for contributor in community.contributor_users],
        "members": [member.user_id for member in community.member_users],
        "guests": [guest.user_id for guest in community.guest_users],
        "prohibited": [prohib.user_id for prohib in community.prohibited_users]
    }
    return user_dict

def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return ids

def getCommunity(community_id):
    community = Community.query.filter_by(id = community_id).first()
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admin_users]}
    return community_dict

def getAllCommunityPostsTimeModified(community_id):
    # NOTE: shouldn't this return for all posts? Also, when we add comments to a post, then that parent post should have modified time updated as well?
    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community_id = community_id)]
    return post_dicts

def getFilteredPosts(limit, community_id, min_date):
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