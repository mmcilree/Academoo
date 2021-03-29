from app import db, guard
from app.models import User, Community, Post, UserRole, PostContentField, UserVote, getTime, PostTag, UserSubscription
from sqlalchemy import desc
import json
from uuid import UUID
import re
from utils import *
from sqlalchemy.sql.elements import Null

# Add new community to db
def createCommunity(community_id, title, description, admin):
    if validate_community_id(community_id): return validate_community_id(community_id)
    
    if Community.query.filter_by(id=community_id).first():
        return ({"title": "Community already exists", "message": "Please pick another community id that is not taken by an existing community"}, 400)

    community = Community(id=community_id, title=title, description=description)
    db.session.add(community)
    
    if not User.query.filter_by(user_id=admin).first():
        return ({"title": "Could not find user" + admin, "message": "User does not exist on database, specify a different user"}, 404)
        

    new_role = UserRole(user_id=admin, community_id=community_id, role="admin")
    db.session.add(new_role)

    db.session.commit()
    return (None, 200)

# Add new entry to UserRole table
def grantRole(username, community_id, current_user, role="member", external=False, user_host=None):
    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_username(username): return validate_username(username)
    if validate_role(role): return validate_role(role)

    user = User.query.filter_by(user_id = username).first()
    if user is None:
        if external:
            # If user on other server, host must be provided
            if user_host is None:
                return ({"title": "external user host not provided", "message": "Please provide external user host by specifying grantRole external_host parameter"}, 400)
            external_user = User(user_id=username, host = user_host)
            db.session.add(external_user)
        else:
            return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 400)
    
    current_role = UserRole.query.filter_by(user_id=current_user, community_id=community_id).first()
    
    if current_role is not None and username == current_user:
        return ({"title": "User cannot change own role", "message": "please choose another user"}, 400)
    
    # Check requester has permission to perform grant role action
    requester = User.lookup(current_user)
    if(requester is not None):
        roles = requester.site_roles.split(",")
        if((not requester.has_role(community_id, "admin")) and ("site-admin" not in roles)):
            return ({"title":"Permissions Error", "message": "User does not have admin privileges so cannot change another user's role"}, 403)
    else:
        return ({"title":"Permissions Error", "message": "User does not have admin privileges so cannot change another user's role"}, 403)

    # If user has existing role, replace it, create new one otherwise
    if UserRole.query.filter_by(user_id=username, community_id=community_id).first() is None:
        new_role = UserRole(user_id=username, community_id=community_id, role=role)
        db.session.add(new_role)
        db.session.commit()
    else:
        existing_role = UserRole.query.filter_by(user_id=username, community_id=community_id).first()
        existing_role.role = role
        db.session.commit()

    return (None, 200)

# Remove site wide roles ofr a user
def removeSiteWideRoles(username, host):
    if(host == "local"):
        user = User.query.filter_by(user_id=username).first()
        if(user is None):
            return({"title":"Could not find user " + username, "message": "User does not exist in database, use a different username"}, 404)
        
        if(user.site_roles != None):
            user.site_roles = "basic"
        db.session.commit()
        return(None, 200)
    else:
        return(None, 400)

# Disable or activate user account
def userAccountActivation(username, host, activation):
    if(host == "local"):
        user = User.query.filter_by(user_id=username).first()
        if(user is None):
            return({"title":"Could not find user " + username, "message": "User does not exist in database, use a different username"}, 404)
        if(activation == "disable"):
            if(user.site_roles != None):
                user.site_roles = None
                db.session.commit()
                return(None, 200)
            else:
                return({"title":"Account is Already Disabled", "message": "This account is already inactive, activate it to change status or leave it inactive."}, 400)
        elif (activation == "active"):
            if((user.site_roles == None) | (user.site_roles == "")):
                user.site_roles = "basic"
            else: 
                assigned_roles = user.site_roles.split(",");  
                for r in assigned_roles:
                    if(r == "basic"):
                        return({"title":"User Account is Already Active", "message": "User already has basic privileges"}, 400)
            roles = user.site_roles + "," + "basic"
            user.site_roles = roles
            db.session.commit()
            return("", 200)
        else:
            return({"title":"Invalid Request", "message": "Could not fulfill request to change user activation status"}, 400)

    else:
        return(None, 400)

# Check user has valid login
def validLogin(username):
    user = User.lookup(username)
    roles = user.site_roles.split(",")
    if(len(roles) == 0 ):
        return False
    elif(roles[0] == ""):
        return False
    else: return True

# Give site wide roles to a user
def addSiteWideRole(admin, username, role, key, host):
    if (host == "local"):
        user = User.query.filter_by(user_id=username).first()
        if(user is None):
            return({"title":"Could not find user" + username, "message": "User does not exist in database, use a different username"}, 404)

        admin_user = User.query.filter_by(user_id=admin).first()
        # need admin or moderator user to perform priviledged action
        if(admin_user == None):
            if not adminMatchesKey(key):
                return({"title":"Unauthorized request from " + username, "message": "User is unauthorized to request admin priviliges, invalid key"}, 401)
        elif(admin == username):
            return({"title": "User cannot set their own permissions", "message": "Contact another admin user to allow permission change"}, 401)
        # Check user is admin or moderator
        if((not role == "site-admin") & (not role == "site-moderator")):
            return({"title":"Invalid role" + role, "message": "Cannot assign this role, make sure role is <site-admin> or <site-moderator>"}, 400)

        if((user.site_roles == None) | (user.site_roles == "")):
            user.site_roles = role
        else: 
            assigned_roles = user.site_roles.split(",");  
            for r in assigned_roles:
                if(r == role):
                    return({"title":"Cannot Add Role " + role, "message": "User already has " + role + " privileges"}, 400)

            roles = user.site_roles + "," + role
            user.site_roles = roles
        db.session.commit()
        return("", 200)
    else:
        return(None, 400)

 # Assign a default role to a community
def setDefaultRole(default_role, community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_role(default_role): return validate_role(default_role)

    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    community.default_role = default_role
    db.session.commit()
    return (None, 200)

# Retrieve community default role
def getDefaultRole(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    community_dict = {"default_role": community.default_role}
    return (community_dict, 200)

# Create a user and add to User table
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

# Retrieve user account object
def getUser(user_id):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    if user is None:
        return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 404)
    user_dict = {"id": user.user_id, 
                "about": user.about, 
                "avatarUrl": "not implemented", 
                "posts": [{"id": post.id, "host": "post.host doesn't exist for now oops"} for post in Post.query.filter_by(author_id=user.id)]
                }
    return (user_dict, 200)

# Get users matching a prefix
def searchUsers(prefix):
    if validate_username(prefix): return validate_username(prefix)

    search = "{}%".format(prefix)
    users = User.query.filter(User.user_id.like(search))
    user_arr = [user.user_id for user in users]
    return (user_arr, 200)

# Update a user accounts bio
def updateBio(user_id, bio):
    if validate_username(user_id): return validate_username(user_id)

    user = User.query.filter_by(user_id = user_id).first()
    user.about = bio
    db.session.commit()

    return True

# Make a user account public or private
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

# Retrieve all user ids
def getUserIDs():
    ids = [user.user_id for user in User.query.all()]
    return (ids, 200)

# Get all roles from a community in form of a dictionary
def getRoles(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id=community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)

    # Dict where each role has a key and an array of users as value
    user_dict = {
        "admins": [user.user_id for user in community.admins()],
        "contributors": [user.user_id for user in community.contributors()],
        "members": [user.user_id for user in community.members()],
        "guests": [user.user_id for user in community.guests()],
        "prohibited": [user.user_id for user in community.prohibited()]
    }
    return (user_dict, 200)

# Get a user that is local to server
def getLocalUser(id):
    if validate_username(id): return validate_username(id)

    user = User.query.filter_by(user_id=id).first()
    if not user:
        return {"title": "Could not find user", "message": "User does not exist!"}, 404
    else:
        if user.private_account:
            user_dict = {"id":user.user_id, "email": "", "host":user.host, "bio":"", "private": user.private_account, "site_roles" : user.site_roles}
            return user_dict, 200
        else:
            user_dict = {"id": user.user_id, "email": user.email, "host": user.host, "bio": user.about, "private": user.private_account,  "site_roles" : user.site_roles}
            return user_dict

# Add a subscriber entry to Subscriber table
def addSubscriber(user_id, community_id, external):
    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_username(user_id): return validate_username(user_id)

    subscription = UserSubscription(user_id=user_id, community_id=community_id, external=external)
    db.session.add(subscription)
    
    db.session.commit()
    return (None, 200)

# Remove subscriber entry from Subcriber table
def removeSubscriber(user_id, community_id, external):
    subscription = UserSubscription.query.filter_by(user_id=user_id, community_id=community_id, external=external).first()
    db.session.delete(subscription)
    db.session.commit() 
    return (None, 200)

# Get all community ids from server
def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return (ids, 200)

# Get community using community id
def getCommunity(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    community = Community.query.filter_by(id = community_id).first()
    if community is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404)
    
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins()]}
    return (community_dict, 200)

# Get a list of all posts in a community and the time in which they were last modified
def getAllCommunityPostsTimeModified(community_id):
    if validate_community_id(community_id): return validate_community_id(community_id)

    if Community.query.filter_by(id = community_id).first() is None:
        return ({"title": "Could not find community" + community_id, "message": "Community does not exist on database, use a different community id"}, 404) 

    post_dicts = [{"id":post.id, "modified":post.modified} for post in Post.query.filter_by(community_id = community_id)]
    return (post_dicts, 200)

# Get a list of post objects filtered by various parameters
def getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type, requester_str):
    # Parameters are optional so if they are none then filtering is missed
    if community_id is not None:  
        if validate_community_id(community_id): return validate_community_id(community_id)
    if author is not None: 
        if validate_username(author): return validate_username(author)
    if parent_post is not None: 
        if validate_post_id(parent_post): return validate_post_id(parent_post)
    
    query = db.session.query(Post)
    if community_id is not None: 
        requester = User.lookup(requester_str)
        # Check user making request has permission to perform action
        if requester is None: 
            community = Community.lookup(community_id) 
            role = community.default_role 
            if ((role == "prohibited")): 
                message = {"title": "Permission error", "message": "Do not have permission to perform action"} 
                return (message, 403)
        elif requester.has_role(community_id, "prohibited"):
            site_wide_roles = requester.site_roles.split(",")
            # Check site wide role permissions
            if (("site-admin" not in site_wide_roles) and ("site-moderator" not in site_wide_roles)):
                message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                return (message, 403)
        query = query.filter(Post.community_id == community_id) 
    if min_date is not None:
        query = query.filter(Post.created >= min_date)
    if author is not None:
        author_entry = User.lookup(author)
        requester_entry = User.lookup(requester_str)
        requester_roles = UserRole.query.filter_by(user_id=requester_str)
        sw_roles = requester_entry.site_roles.split(",")
        # Check site wide role permissions
        if(("site-admin" in sw_roles) or ("site-moderator" in sw_roles)):
            query = query.filter(Post.author_id == author)
        else:
            # If author account is private, only author can retrieve post
            if (author == requester_str or (not author_entry.private_account)):
                query = query.filter(Post.author_id == author)
                if requester_entry is None and requester_roles is None:
                    query = query.filter(Post.community.default_role != "prohibited")
                else:
                    requester_prohibited = UserRole.query.filter(UserRole.user_id == requester_str and UserRole.role == "prohibited")
                    prohibited_communities = [role.community.id for role in requester_prohibited]
                    query = query.filter(Post.community_id.notin_(prohibited_communities))
            else:
                message = {"title": "Private Account", "message": "These posts cannot be viewed as the specified user has a private account."}
                return (message, 403)
    if parent_post is not None:
        query = query.filter(Post.parent_id == parent_post)
    if content_type is not None:
        valid_posts = [content_field.post_id for content_field in PostContentField.query.filter(content_type=content_type).all()]
        query = query.filter(Post.id.in_(valid_posts))
    
    if include_children == "false":
        query = query.filter(Post.parent_id == None)
    
    query = query.order_by(desc(Post.created))
    if limit is not None:
        query = query.limit(limit)
    
    post_dicts = [
        {
            "id": post.id, 
            "community": post.community_id, 
            "parentPost": post.parent_id, 
            "children": [comment.id for comment in post.comments], 
            "title": post.title, 
            "content": [{cont_obj.content_type: cont_obj.json_object} for cont_obj in post.content_objects], 
            "author": {"id": post.author.user_id if post.author else None, "host": post.author.host if post.author else None}, 
            "modified": post.modified, 
            "created": post.created,
            "upvotes": post.upvotes,
            "downvotes": post.downvotes
        } for post in query]
    
    return (post_dicts, 200)

# Create post and add to Post table
def createPost(post_data, author_id, author_host):
    community_id = post_data["community"]
    parent_post = post_data.get("parentPost")
    title = post_data["title"]
    content_json = post_data["content"]
    author_id = author_id
    author_host = author_host

    if validate_community_id(community_id): return validate_community_id(community_id)
    if validate_username(author_id): return validate_username(author_id)

    if parent_post is not None and len(parent_post) == 0:
        parent_post = None

    author = User.query.filter_by(user_id = author_id).first()
    
    if parent_post is not None: 
        if validate_post_id(parent_post): return validate_post_id(parent_post)
    
    #Permissions for top-level post
    if parent_post is None:
        if author is None:
            community = Community.lookup(community_id)
            role = community.default_role
            if ((role != "contributor") & (role != "admin")):
                message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                return (message, 403)
        else :
            # Check site wide roles
            site_roles = author.site_roles.split(",")
            if(("site-admin" not in site_roles) and ("site-moderator" not in site_roles)):
                if not author.has_role(community_id, "contributor"):
                    message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                    return (message, 403)

    if author is None:
        new_user = User(user_id = author_id, host = author_host)
        db.session.add(new_user)
    
    new_post = Post(community_id=community_id, title=title, parent_id=parent_post, author_id=author_id)
    db.session.add(new_post)
    db.session.commit()

    # Create PostContentField entries in table
    for entry in content_json:
        key = list(entry.keys())[0]
        content_field = PostContentField(post_id=new_post.id, content_type=key, json_object=entry[key])
        db.session.add(content_field)

    db.session.commit()
    return getPost(new_post.id, author_id)

# Retrieve post object
def getPost(post_id, requester_str):
    if validate_post_id(post_id): return validate_post_id(post_id)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)
    
    # Check requester has permission to perform action
    requester = User.lookup(requester_str)
    if requester is None:
        community = Community.lookup(post.community_id)
        role = community.default_role
        if ((role == "prohibited")):
            message = {"title": "Permission error", "message": "Do not have permission to perform action"}
            return (message, 403)
    elif requester.has_role(post.community_id, "prohibited"):
        site_wide_roles = requester.site_roles.split(",")
        # Check site wide roles
        if (("site-admin" not in site_wide_roles) and ("site-moderator" not in site_wide_roles)):
            message = {"title": "Permission error", "message": "Do not have permission to perform action"}
            return (message, 403)
    
    post_dict = {
            "id": post.id, 
            "community": post.community_id, 
            "parentPost": post.parent_id, 
            "children": [comment.id for comment in post.comments], 
            "title": post.title, 
            "content": [{cont_obj.content_type: cont_obj.json_object} for cont_obj in post.content_objects], 
            "author": {"id": post.author.user_id if post.author else None, 
            "host": post.author.host if post.author else None}, 
            "modified": post.modified, 
            "created": post.created,
            "upvotes": post.upvotes,
            "downvotes": post.downvotes
            }
    return (post_dict, 200)

# Edit post entry
def editPost(post_id, post_data, requester):
    if validate_post_id(post_id): return validate_post_id(post_id)

    update_title = post_data["title"]
    update_content_json = post_data["content"]

    post = Post.query.filter_by(id = post_id).first()
    
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    site_roles = requester.site_roles.split(",")

    if ((requester.user_id != post.author.user_id) and ("site-moderator" not in site_roles)):
        return ({"title": "Permission denied " + post_id, "message": "User does not have permission to edit this post"}, 403)
    
    post.title = update_title
    
    # Delete existing entries for post content objects
    for content_field in post.content_objects:
        db.session.delete(content_field)
    db.session.commit()
    
    # Add new post content objects
    for entry in update_content_json:
        key = list(entry.keys())[0]
        content_field = PostContentField(post_id=post.id, content_type=key, json_object=entry[key])
        db.session.add(content_field)

    db.session.commit()
    return getPost(post_id, requester.user_id)

# Delete a post from db
def deletePost(post_id, requester):
    if validate_post_id(post_id): return validate_post_id(post_id)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    # Check site wide roles
    site_roles = requester.site_roles.split(",")
    if ((requester.user_id != post.author.user_id) and (not requester.has_role(post.community_id, "admin")) and  ("site-moderator" not in site_roles)):
        return ({"title": "Permission denied " + post_id, "message": "User does not have permission to delete this post"}, 403)

    db.session.delete(post)
    db.session.commit()
    return (None, 200)

# Convenience function to ensure post ordering
def order_post_arr(post_arr, reverse=False):
    return sorted(post_arr, key=lambda post: post['created'], reverse= reverse)

# Add an upvote to a post
def upvotePost(user_id, post_id):
    if validate_post_id(post_id): return validate_post_id(post_id)

    user = User.query.filter_by(user_id = user_id).first()
    if user is None:
        return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 400)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    
    current_vote = UserVote.query.filter_by(user_id=user_id, post_id=post_id).first()
    
    if current_vote is None:
        new_vote = UserVote(user_id=user_id, post_id=post_id, value="upvote")
        post.upvotes += 1
        db.session.add(new_vote)
        db.session.commit() 
    # Need to ensure user cannot vote twice, so must be replaced
    else:
        existing_vote = UserVote.query.filter_by(user_id=user_id, post_id=post_id).first()
        if existing_vote.value == "upvote":
            post.upvotes -= 1
            existing_vote.value =  "none"
        elif existing_vote.value == "downvote":
            existing_vote.value = "upvote"
            post.upvotes += 1
            post.downvotes -= 1
        else:
            existing_vote.value = "upvote"
            post.upvotes += 1


        db.session.commit()

    db.session.commit()
    
    return (None, 200)

# Add downvote to a post
def downvotePost(user_id, post_id):
    if validate_post_id(post_id): return validate_post_id(post_id)

    user = User.query.filter_by(user_id = user_id).first()
    if user is None:
        return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 400)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)

    current_vote = UserVote.query.filter_by(user_id=user_id, post_id=post_id).first()

    if current_vote is None:
        new_vote = UserVote(user_id=user_id, post_id=post_id, value="downvote")
        db.session.add(new_vote)
        db.session.commit()
    # Need to ensure user cannot vote twice, so must be replaced
    else:
        existing_vote = UserVote.query.filter_by(user_id=user_id, post_id=post_id).first()
        if existing_vote.value == "downvote":
            post.downvotes -= 1
            existing_vote.value =  "none"
        elif existing_vote.value == "upvote":
            existing_vote.value = "downvote"
            post.upvotes -= 1
            post.downvotes += 1
        else:
            existing_vote.value = "downvote"
            post.downvotes += 1
        db.session.commit()

    db.session.commit()
    
    return (None, 200)

# Get vote value of a post
def getVote(user_id, post_id):
    if validate_post_id(post_id): return validate_post_id(post_id)
    user = User.query.filter_by(user_id = user_id).first()
    if user is None:
        return ({"title": "User does not exist", "message": "User does not exist, use another username associated with an existing user"}, 400)

    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)
    
    current_vote = UserVote.query.filter_by(user_id=user_id, post_id=post_id).first()
    if current_vote is None:
        vote_dict = {"vote": "none"}
    else:
        vote_dict = {"vote": current_vote.value}
    return (vote_dict, 200)

# Change a user accounts password
def changePassword(username, old_password, new_password):
    user = guard.authenticate(username, old_password)
    if user:
        user.password_hash = guard.hash_password(new_password)
        db.session.commit()
        return True
    
    return False

# Delete a user account
def deleteUser(username, password):
    user = guard.authenticate(username, password)
    if user:
        db.session.delete(user)
        db.session.commit()
        return True

# Add a post tag
def addTag(post_id, tag_name):
    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)
    new_tag = PostTag(post_id=post_id, tag=tag_name)
    db.session.add(new_tag)
    db.session.commit()
    return (None, 200)

# Delete a post tag
def deleteTag(post_id, tag_name):
    post_tag = PostTag.query.filter_by(post_id=post_id, tag=tag_name)
    if post_tag is None:
        return ({"title": "could not find post tag", "message": "either post does not exist or post does not have tag"}, 404)
    db.session.delete(post_tag)
    db.session.commit()
    return (None, 200)

# Get all post tags from a post
def getPostTags(post_id):
    post = Post.query.filter_by(id = post_id).first()
    if post is None:
        return ({"title": "could not find post id " + post_id, "message": "Could not find post id, use another post id"}, 404)
    return [post_tag.tag for post_tag in post.tags]
