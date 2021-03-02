from app import db, guard
from app.models import User, Community, Post, UserRole, PostContentField, getTime
from sqlalchemy import desc
import json
from uuid import UUID
import re
from utils import *
from sqlalchemy.sql.elements import Null

def createCommunity(community_id, title, description, admin):
    if validate_community_id(community_id): return validate_community_id(community_id)
    
    if Community.query.filter_by(id=community_id).first() is not None:
        return ({"title": "Community already exists", "message": "Please pick another community id that is not taken by an existing community"}, 400)

    community = Community(id=community_id, title=title, description=description)
    db.session.add(community)
    
    if User.query.filter_by(user_id=admin) is None:
        return ({"title": "Could not find user" + admin, "message": "User does not exist on database, specify a different user"}, 404)
        
    response = grantRole(admin, community_id, admin, "admin")
    if response[1] != 200:
        return response

    db.session.commit()
    return (None, 200)

# TODO: We need to handle granting roles to external users too
def grantRole(username, community_id, current_user, role="member", external=False, user_host=None):
    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_username(username): return validate_username(username)
    if validate_role(role): return validate_role(role)

    user = User.query.filter_by(user_id = username).first()
    if user is None:
        if external:
            if user_host is None:
                return ({"title": "external user host not provided", "message": "Please provide external user host by specifying grantRole external_host parameter"}, 400)
            external_user = User(user_id=username, host = user_host)
            db.session.add(external_user)
        else:
            return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 400)
    
    current_role = UserRole.query.filter_by(user_id=current_user, community_id=community_id).first()

    if current_role is not None and username == current_user:
        return ({"title": "User cannot change own role", "message": "please choose another user"}, 400)

    if UserRole.query.filter_by(user_id=username, community_id=community_id).first() is None:
        new_role = UserRole(user_id=username, community_id=community_id, role=role)
        db.session.add(new_role)
        db.session.commit()
    else:
        existing_role = UserRole.query.filter_by(user_id=username, community_id=community_id).first()
        existing_role.role = role
        db.session.commit()

    
    return (None, 200)

def removeSiteWideRoles(username, host):
    if(host == "local"):
        user = User.query.filter_by(user_id=username).first()
        if(user is None):
            return({"title":"Could not find user " + username, "message": "User does not exist in database, use a different username"}, 404)
        
        if(user.site_roles != None):
            user.site_roles = ""
        db.session.commit()
        return(None, 200)
    else:
        # Add support for roles for external users
        return(None, 400)


def addSiteWideRole(admin, username, role, key, host):
    if (host == "local"):
        user = User.query.filter_by(user_id=username).first()
        if(user is None):
            return({"title":"Could not find user" + username, "message": "User does not exist in database, use a different username"}, 404)

        admin_user = User.query.filter_by(user_id=admin).first()
        if(admin_user == None):
            if not adminMatchesKey(key):
                return({"title":"Unauthorized request from " + username, "message": "User is unauthorized to request admin priviliges, invalid key"}, 401)
        elif(admin == username):
            return({"title: User cannot set their own permissions, message: Contact another admin user to allow permission change"}, 401)
        if((not role == "site-admin") & (not role == "site-moderator")):
            return({"title":"Invalid role" + role, "message": "Cannot assign this role, make sure role is <site-admin> or <site-moderator>"}, 400)

        if((user.site_roles == None) | (user.site_roles == "")):
            user.site_roles = role
        else: 
            assigned_roles = user.site_roles.split(",");  
            if(len(assigned_roles) == 1):
                if(assigned_roles[0] == role):
                    return({"title":"Cannot Add Role " + role, "message": "User already has " + role + " privileges"}, 400)
            elif(len(assigned_roles) == 2):
                return({"title":"Cannot Add Role " + role, "message": "User already has admin and moderator privileges"}, 400)
            
            roles = user.site_roles + "," + role
            user.site_roles = roles
        db.session.commit()
        return("", 200)
    else:
        # add functionality for roles for external users
        return(None, 400)

def setDefaultRole(default_role, community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_role(default_role): return validate_role(default_role)

    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    community.default_role = default_role
    db.session.commit()
    return (None, 200)

def getDefaultRole(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    community_dict = {"default_role": community.default_role}
    return (community_dict, 200)

def createUser(username, email, password):
    if validate_username(username): return validate_username(username)

    if db.session.query(User).filter_by(user_id=username).count() < 1 and db.session.query(User).filter_by(email=email).count() < 1:
        db.session.add(User(
            user_id=username,
            email=email,
            password_hash=guard.hash_password(password),
            host="Academoo",
        ))
        db.session.commit()
        return (None, 200)
    
    return ({"title": "Username already taken by another user", "message": "Please pick another username that is not taken by an existing user"}, 400)

def getUser(user_id):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    if user is None:
        return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 404)
    user_dict = {"id": user.user_id, "posts": [{"id": post.id, "host": "post.host doesn't exist for now oops"} for post in Post.query.filter_by(author_id=user.id)]}#########################
    return (user_dict, 200)

def searchUsers(prefix):
    if validate_username(prefix): return validate_username(prefix)

    search = "{}%".format(prefix)
    users = User.query.filter(User.user_id.like(search))
    user_arr = [user.user_id for user in users]
    return (user_arr, 200)

def updateBio(user_id, bio):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    user.bio = bio
    db.session.commit()

def updatePrivacy(user_id, private_account):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    if private_account == "private" :
        user.private_account = True
    elif private_account == "public":
        user.private_account = False
    else:
        return False
    db.session.commit()
    user_dict = {"id": user.user_id, "private": private_account}
    return user_dict

def getUserIDs():
    ids = [user.user_id for user in User.query.all()]
    return (ids, 200)

def getRoles(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)

    user_dict = {
        "admins": [user.user_id for user in community.admins()],
        "contributors": [user.user_id for user in community.contributors()],
        "members": [user.user_id for user in community.members()],
        "guests": [user.user_id for user in community.guests()],
        "prohibited": [user.user_id for user in community.prohibited()]
    }
    return (user_dict, 200)


def getLocalUser(id):
    if validate_username(id): return validate_username(id)

    user = User.query.filter_by(user_id=id).first()
    if(user == None):
        return False
    else:
        if user.private_account:
            user_dict = {"id":user.user_id, "email": "", "host":user.host, "bio":"", "site_roles" : user.site_roles}
            return user_dict
        else:
            user_dict = {"id": user.user_id, "email": user.email, "host": user.host, "bio": user.bio, "site_roles" : user.site_roles}
            return user_dict

def addSubscriber(user_id, community_id):
    user = User.query.filter_by(user_id = user_id).first()
    community = Community.query.filter_by(id = community_id).first()
    user.subscribed_communities.append(community)

    db.session.commit()
    return (None, 200)

def removeSubscriber(user_id, community_id):
    user = User.query.filter_by(user_id = user_id).first()
    community = Community.query.filter_by(id = community_id).first()
    user.subscribed_communities.remove(community)

    db.session.commit()
    return (None, 200)

def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return (ids, 200)

def getCommunity(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins()]}
    return (community_dict, 200)

def getAllCommunityPostsTimeModified(community_id):
    # NOTE: shouldn't this return for all posts? Also, when we add comments to a post, then that parent post should have modified time updated as well?
    # it do do that though
    if validate_community_id(community_id): return validate_community_id(community_id)

    if Community.query.filter_by(id = community_id).first() is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)

    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community_id = community_id)]
    return (post_dicts, 200)

# Post host isnt a thing right now
def getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type):
    if community_id is not None: 
        if validate_community_id(community_id): return validate_community_id(community_id)
    if author is not None: 
        if validate_username(author): return validate_username(author)
    if parent_post is not None: 
        if validate_post_id(parent_post): return validate_post_id(parent_post)
    
    query = db.session.query(Post)
    if community_id is not None:
        query = query.filter(Post.community_id == community_id)
    if min_date is not None:
        query = query.filter(Post.created >= min_date)
    if author is not None:
        query = query.filter(Post.author_id == author)
    #if host is not None:
        #query = query.filter(Post.host == host)
    if parent_post is not None:
        query = query.filter(Post.parent_id == parent_post)
    if content_type is not None:
        valid_posts = [content_field.post_id for content_field in PostContentField.query.filter(content_type=content_type).all()]
        query = query.filter(Post.id.in_(valid_posts))
    if include_children is None:
        query = query.filter(Post.parent_id == None)
    query = query.order_by(desc(Post.created))
    if limit is not None:
        query = query.limit(limit)


    ''' leave for just now maybe useless idk
    if include_children:
        for post in query:
            post_children = getFilteredPosts(limit, community_id, min_date, author, host, post.id, True, content_type)
            query += post_children
    '''
    
    post_dicts = [{"id": post.id, "community": post.community_id, "parentPost": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content": [{cont_obj.content_type: cont_obj.json_object} for cont_obj in post.content_objects], "author": {"id": post.author.user_id if post.author else None, "host": post.author.host if post.author else None}, "modified": post.modified, "created": post.created} for post in query]
    
    return (post_dicts, 200)

# Post host may not be tied to author idk
# Author host is not in json file so will need to passed in manually :(
def createPost(post_data, author_id, author_host):
    community_id = post_data["community"]
    parent_post = post_data["parentPost"]
    title = post_data["title"]
    content_json = post_data["content"]
    author_id = author_id
    author_host = author_host

    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_username(author_id): return validate_username(author_id)

    if parent_post is not None and len(parent_post) == 0:
        parent_post = None

    if parent_post is not None: 
        if validate_post_id(parent_post): return validate_post_id(parent_post)

    if User.query.filter_by(user_id = author_id).first() is None:
        new_user = User(user_id = author_id, host = author_host)
        db.session.add(new_user)
    
    new_post = Post(community_id=community_id, title=title, parent_id=parent_post, author_id=author_id)
    db.session.add(new_post)
    db.session.commit()

    for entry in content_json:
        key = list(entry.keys())[0]
        content_field = PostContentField(post_id=new_post.id, content_type=key, json_object=entry[key])
        db.session.add(content_field)

    db.session.commit()
    return (None, 200)

def getPost(post_id):
    if validate_post_id(post_id): return validate_post_id(post_id)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    post_dict = {"id": post.id, "community": post.community_id, "parentPost": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content": [{cont_obj.content_type: cont_obj.json_object} for cont_obj in post.content_objects], "author": {"id": post.author.user_id if post.author else None, "host": post.author.host if post.author else None}, "modified": post.modified, "created": post.created}
    return (post_dict, 200)

def editPost(post_id, post_data, requester):
    if validate_post_id(post_id): return validate_post_id(post_id)

    update_title = post_data["title"]
    update_content_json = post_data["content"]

    post = Post.query.filter_by(id = post_id).first()
    
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    if requester.user_id != post.author.user_id:
        return ({"title": "Permission denied " + post_id, "message": "User does not have permission to edit this post"}, 403)


    post.title = update_title
    
    for content_field in post.content_objects:
        db.session.delete(content_field)
    db.session.commit()

    for entry in update_content_json:
        key = list(entry.keys())[0]
        content_field = PostContentField(post_id=post.id, content_type=key, json_object=entry[key])
        db.session.add(content_field)

    db.session.commit()
    return (None, 200)

def deletePost(post_id, requester):
    # assuming deleting a post will delete all postcontentobjects associated with it until it get proven wrong eventually
    if validate_post_id(post_id): return validate_post_id(post_id)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    if requester.user_id != post.author.user_id:
        return ({"title": "Permission denied " + post_id, "message": "User does not have permission to delete this post"}, 403)

    #will need to recursively delete comments
    ''' comment.id will not exist if comment is None
    print(post.comments)
    for comment in post.comments:
        if comment is None:
            return ({"title": "could not find comment id " + comment.id, "message": "Could not find comment id, use another comment id"}, 404)
        db.session.delete(comment)
    '''

    # probably needs a cascade delete or something
    db.session.delete(post)
    db.session.commit()
    return (None, 200)

def changePassword(username, old_password, new_password):
    user = guard.authenticate(username, old_password)
    if user:
        user.password_hash = guard.hash_password(new_password)
        db.session.commit()
        return True
    
    return False

def deleteUser(username):
    user = User.query.get(username)
    db.session.delete(user)
    db.session.commit()

    return True
