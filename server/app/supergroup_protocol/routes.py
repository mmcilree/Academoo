from requests import status_codes
from app import actions, instance_manager
from app.supergroup_protocol import bp
from app.digital_signatures import verify_request
from flask import jsonify, request, Response, current_app
from app.models import User, Community
from utils import *
import json

# TODO: Get client-host and host from data

def respond_with_action(actionResponse):
    data, status = actionResponse
    if data is None:
        return Response(status=status)
    else:
        return jsonify(data), status
        
@bp.route("/key", methods=["GET"])
def get_key():
    response = Response(current_app.config["PUBLIC_KEY"], mimetype="application/x-pem-file")
    return response

# User
@bp.route("/users", methods=["GET"])
def get_all_users():
    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/users")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getUserIDs())
    else:
        return instance_manager.get_users(external)

@bp.route("/users/<id>", methods=["GET"])
def get_user_by_id(id):
    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/users/{id}")
        if status_code != 200: return jsonify(message), status_code

        return jsonify(actions.getLocalUser(id))
    else:
        return instance_manager.get_users(external, id=id)

# Community
@bp.route("/communities", methods=["GET"])
def get_all_communities():
    host = request.headers.get("Client-Host")
    #if host is None:
    #    return Response(status = 400) #### remember to include json error message with it
    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/communities")
        if status_code != 200: return jsonify(message), status_code

        body, status = actions.getCommunityIDs() # what does this line achieve?
        return respond_with_action(actions.getCommunityIDs())
    else:
        headers = {"Client-Host": host}
        return instance_manager.get_communities(external, headers)

@bp.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    host = request.headers.get("Client-Host")
    #if host is None:
    #    return Response(status = 400)
    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/communities/{id}")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getCommunity(id))
    else:
        headers = {"Client-Host": host}
        return instance_manager.get_communities(external, headers, id=id)

@bp.route("/communities/<id>/timestamps")
def get_community_timestamps(id): # no option for federation?
    ##headers = request.headers['Client-Host']
    message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/communities/{id}/timestamps")
    if status_code != 200: return jsonify(message), status_code

    return respond_with_action(actions.getAllCommunityPostsTimeModified(id))

# Posts
@bp.route("/posts", methods=["GET"])
def get_all_posts():
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    #if host is None or requester_str is None:
    #    return Response(status = 400)
    # limit, community, min_date
    limit = int(request.args.get("limit", 20))
    community_id = request.args.get("community")
    min_date = request.args.get("minDate", 0)
    author = request.args.get("author")
    parent_post = request.args.get("parentPost")
    include_children = request.args.get("includeSubChildrenPosts")
    content_type = request.args.get("contentType")

    external = request.args.get("external")
    
    # requester = User.lookup(requester_str)
    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/posts")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type, requester_str))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        response = instance_manager.get_posts(external, community_id, headers)
        if response[1] != 200:
            return response
        responseArr = response[0]
        for post in responseArr:
            post['host'] = external

        responseArr = actions.order_post_arr(responseArr, True)
        return jsonify(responseArr), response[1]

@bp.route("/posts/<id>", methods=["GET"])
def get_post_by_id(id):
    external = request.args.get("external")
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    #if host is None or requester_str is None:
    #    return Response(status = 400)


    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/posts/{id}")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getPost(id, requester_str))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        response = instance_manager.get_post_by_id(external, id, headers)
        if response[1] != 200:
            return response
        post = response[0]
        post['host'] = external
        
        return jsonify(post), response[1]

@bp.route("/posts", methods=["POST"])
def create_post():
    if request.json is not None: # ??? wont there be nothing to post if request.json is None????
        external = request.json.get("external", None)
    else: external = None

    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")

    #if host is None or requester_str is None:
    #    return Response(status = 400)

    if check_create_post(request.get_json(silent=True, force=True)): return check_create_post(request.get_json(silent=True, force=True))

    requester = User.lookup(requester_str)
    if external is None:
        message, status_code = verify_request(
            headers=request.headers, 
            request_target=f"post /fed/posts",
            body=bytes(str(request.json), "utf-8")
        )
        if status_code != 200: return jsonify(message), status_code

        community_id = request.json["community"]
        #Permissions for comments as minimum
        if requester is None:
            community = Community.lookup(community_id)
            role = community.default_role
            if ((role != "member") & (role != "contributor") & (role != "admin")):
                message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                return jsonify(message), 403
        else :
            site_roles = requester.site_roles.split(",")
            if(("site-admin" not in site_roles) and ("site-moderator" not in site_roles)):
                if not requester.has_role(community_id, "member") :
                    message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                    return jsonify(message), 403

        return respond_with_action(actions.createPost(request.json, requester_str, host))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        return instance_manager.create_post(external, request.json, headers)

@bp.route("/posts/<id>", methods=["PUT"])
def edit_post(id):
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    #if host is None or requester_str is None:
    #    return Response(status = 400)
    if request.json is not None:
        external = request.json.get("external", None)
    else: external = None # Changed from request.json.get("external") as external not field in create_post json

    if check_edit_post(request.get_json(silent=True, force=True)): return check_edit_post(request.get_json(silent=True, force=True))

    requester = User.lookup(requester_str)

    if external is None:
        message, status_code = verify_request(
            headers=request.headers, 
            request_target=f"put /fed/posts",
            body=bytes(str(request.json), "utf-8")
        )
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.editPost(id, request.json, requester))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        return instance_manager.edit_post(external, request.json, id, headers)

@bp.route("/posts/<id>", methods=["DELETE"]) ################################### NO EXTERNAL FIELD FOR DELETING ON OTHER SERVERS :(
def delete_post(id):
    external = request.args.get("external")

    host = request.headers.get("Client-Host") 
    requester_str = request.headers.get("User-ID")
    #if host is None or requester_str is None:
    #    return Response(status = 400)

    requester = User.lookup(requester_str)
    if external is None:
        message, status_code = verify_request(
            headers=request.headers, 
            request_target=f"delete /fed/posts/{id}",
            body=bytes(str(request.json), "utf-8")
        )
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.deletePost(id, requester))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        return instance_manager.delete_post(external, request.json, id, headers) # NOTE: wait why does delete post have json?
