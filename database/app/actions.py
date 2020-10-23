from app import db
from app.models import *
import json

def getCommunityIDs():
    ids = [community.id for community in Community.query.all()]
    return json.dumps(ids)

def getCommunity(target_id):
    community = User.query.filter_by(id = 'target_id').first()
    community_dict = {"id": community.id, "title": community.title, "description": community.description, "admins": [{"id": admin.user_id, "host": admin.host} for admin in community.admins]}
    return json.dumps(community_dict)

def getAllCommunityPostsTimeModified():
    community_dicts = [{"id":community.id, "modified":community.modified} for community in Community.query.all()]
    return json.dumps(community_dicts)

def getFilteredPosts(limit, community, min_date):
    posts = Post.query.filter_by(created >= min_date, ).limit(limit)
    post_dicts = [{"id": post.id, "parent": post.parent_id, "children": [comment.id for comment in post.comments], "title": post.title, "content-type": post.content_type, "body": post.body, "author": {"id": post.admin.id, "host": post.admin.host}, "modified": post.modified, "created": post.created} for post in posts]
    return json.dumps(post_dicts)

def createPost(json):
    pass

def getPost(id):
    pass

def editPost(id, json):
    pass

def deletePost(id):
    pass