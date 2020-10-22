from app import db
from app.models import *
import json

def getCommunityIDs():
    ids = [community.id for community in User.query.all()]
    return json.dumps(ids)

def getCommunity(target_id):
    community = User.query.filter_by(id = 'target_id').first()
    return json.dumps(community.__dict__)

def getAllCommunityPostsTimeModified():
    pass

def getFilteredPosts(limit, community, min_date):
    pass

def createPost(json):
    pass

def getPost(id):
    pass

def editPost(id, json):
    pass

def deletePost(id):
    pass