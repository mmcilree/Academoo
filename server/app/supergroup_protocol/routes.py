from app import actions, federation
from app.supergroup_protocol import bp
from flask import jsonify, request, Response
from app.models import User, Community
from utils import *
import json

def respond_with_action(actionResponse):
    data, status = actionResponse
    if data is None:
        return Response(status=status)
    else:
        return jsonify(data), status
# User
@bp.route("/users", methods=["GET"])
def get_all_users():
    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getUserIDs())
    else:
        return jsonify(federation.get_users(external))

@bp.route("/users/<id>", methods=["GET"])
def get_user_by_id(id):
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getLocalUser(id))
    else:
        return jsonify(federation.get_users(external, id=id))

# Community
@bp.route("/communities", methods=["GET"])
def get_all_communities():
    external = request.args.get("external")

    if not external:
        body, status = actions.getCommunityIDs()
        return respond_with_action(actions.getCommunityIDs())
    else:
        return jsonify(federation.get_communities(external))

@bp.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getCommunity(id))
    else:
        return jsonify(federation.get_communities(external, id=id))

@bp.route("/communities/<id>/timestamps")
def get_community_timestamps(id):
    return respond_with_action(actions.getAllCommunityPostsTimeModified(id))

# Posts
@bp.route("/posts", methods=["GET"])
def get_all_posts():
    # limit, community, min_date
    limit = int(request.args.get("limit", 20))
    community_id = request.args.get("community")
    min_date = request.args.get("minDate", 0)
    author = request.args.get("author")
    host = request.args.get("host")
    parent_post = request.args.get("parentPost")
    include_children = request.args.get("includeSubChildrenPosts")
    content_type = request.args.get("contentType")

    external = request.args.get("external")
    print("external is " + str(external))

    if not external:
        return respond_with_action(actions.getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type))
    else:
        responseArr = federation.get_posts(external, community_id)
        for post in responseArr:
            post['host'] = external
        
        return jsonify(responseArr)

@bp.route("/posts/<id>", methods=["GET"])
def get_post_by_id(id):
    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getPost(id))
    else:
        post = federation.get_post_by_id(external, id)
        post['host'] = external
        
        return jsonify(post)

@bp.route("/posts", methods=["POST"])
def create_post():
    external = request.json.get("external")
    print("EXTERNAL IS " + str(external))
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if host is None:
        return Response(status = 400)

    if check_create_post(request.get_json(silent=True)): return check_create_post(request.get_json(silent=True))

    if external is None:
        requester = User.lookup(requester_str)
        community_id = request.json["community"]
        if not requester.has_role(community_id, "guest"):
            community = Community.lookup(community_id)
            role = community.default_role
            if ((role != "contributor") & (role != "admin")):
                return Response(status = 403)
        else :
            if not requester.has_role(community_id, "contributor"):
                return Response(status = 403)
        
        return respond_with_action(actions.createPost(request.json))
    else:
        return federation.create_post(external, request.json)

    #return Response(status = 201)

@bp.route("/posts/<id>", methods=["PUT"])
def edit_post(id):
    external = request.json.get("external") # Changed from request.json.get("external") as external not field in create_post json
    print("EXTERNAL IS " + str(external))

    host = request.headers.get("Client-Host") 
    requester_str = request.headers.get("User-ID")
    if host is None or requester_str is None:
        return Response(status = 400)

    if check_edit_post(request.get_json(silent=True)): return check_edit_post(request.get_json(silent=True))

    requester = User.lookup(requester_str)

    if external is None:
        actions.editPost(id, request.json, requester)
    else:
        federation.edit_post(external, request.json)

    return Response(status = 200)

@bp.route("/posts/<id>", methods=["DELETE"])
def delete_post(id):
    external = request.args.get("external")
    print("EXTERNAL IS " + str(external))

    host = request.headers.get("Client-Host") 
    requester_str = request.headers.get("User-ID")
    if host is None or requester_str is None:
        return Response(status = 400)

    requester = User.lookup(requester_str)

    if external is None:
        actions.deletePost(id, requester)
    else:
        federation.delete_post(external, request.json)

    return Response(status = 200)
