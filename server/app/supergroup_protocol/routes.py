from requests import status_codes
from app import actions, instance_manager
from app.supergroup_protocol import bp
from app.digital_signatures import verify_request
from flask import jsonify, request, Response, current_app
from app.models import User, Community
from utils import *
import json

# Sent to external server when request headers are not as expected
client_host_error = {"title": "Incorrect Headers", "message": "The given headers do not comply with the specification"}

# Converts output from calls to actions.py to a network sendable format
def respond_with_action(actionResponse):
    data, status = actionResponse
    if data is None:
        return Response(status=status)
    else:
        return jsonify(data), status

# Get available instances to federate with
@bp.route("/discover", methods=["GET"])
def discover():
    instances = []
    for inst in instance_manager.instances.values():
        instances.append(inst.url)
    
    return jsonify(instances)

@bp.route("/key", methods=["GET"])
def get_key():
    response = Response(current_app.config["PUBLIC_KEY"], mimetype="application/x-pem-file")
    return response

# Get a list of all users in this server
@bp.route("/users", methods=["GET"])
def get_all_users():
    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/users")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getUserIDs())
    else:
        return instance_manager.get_users(external)

# Get a specific user from this server by id
@bp.route("/users/<id>", methods=["GET"])
def get_user_by_id(id):
    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/users/{id}")
        if status_code != 200: return jsonify(message), status_code

        message, status_code = actions.getLocalUser(id)
        return jsonify(message), status_code
    else:
        return instance_manager.get_users(external, id=id)

# Get a list of community ids from this server
@bp.route("/communities", methods=["GET"])
def get_all_communities():
    host = request.headers.get("Client-Host")
    if not host: return jsonify(client_host_error), 400

    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/communities")
        if status_code != 200: return jsonify(message), status_code

        body, status = actions.getCommunityIDs()
        return respond_with_action(actions.getCommunityIDs())
    else:
        # Headers as specified in supergroup protocol
        headers = {"Client-Host": host}
        return instance_manager.get_communities(external, headers)

# Get a json representation of a community by id
@bp.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    host = request.headers.get("Client-Host")
    if not host: return jsonify(client_host_error), 400

    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/communities/{id}")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getCommunity(id))
    else:
        # Headers as specified in supergroup protocol
        headers = {"Client-Host": host}
        return instance_manager.get_communities(external, headers, id=id)

# Get a list of all posts and when they were last modified in a community
@bp.route("/communities/<id>/timestamps")
def get_community_timestamps(id):
    host = request.headers.get("Client-Host")
    if not host: return jsonify(client_host_error), 400

    message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/communities/{id}/timestamps")
    if status_code != 200: return jsonify(message), status_code

    return respond_with_action(actions.getAllCommunityPostsTimeModified(id))

# Get json representation of posts using a set of filters
@bp.route("/posts", methods=["GET"])
def get_all_posts():
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if not host or not requester_str: return jsonify(client_host_error), 400

    limit = int(request.args.get("limit", 20))
    community_id = request.args.get("community")
    min_date = request.args.get("minDate", 0)
    author = request.args.get("author")
    parent_post = request.args.get("parentPost")
    include_children = request.args.get("includeSubChildrenPosts")
    content_type = request.args.get("contentType")
    # external field specifies whether target is from this server or external server
    external = request.args.get("external")

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/posts")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type, requester_str))
    else:
        # Headers as specified in supergroup protocol
        headers = {"Client-Host": host, "User-ID": requester_str}
        response = instance_manager.get_posts(external, community_id, headers)
        # If request was unsuccessful immediately return response error
        if response[1] != 200:
            return response
        responseArr = response[0]
        for post in responseArr:
            post['host'] = external

        # Pre order posts in json array
        responseArr = actions.order_post_arr(responseArr, True)
        return jsonify(responseArr), response[1]

# Get a json representation of a post by id
@bp.route("/posts/<id>", methods=["GET"])
def get_post_by_id(id):
    external = request.args.get("external")
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if not host or not requester_str: return jsonify(client_host_error), 400

    if not external:
        message, status_code = verify_request(headers=request.headers, request_target=f"get /fed/posts/{id}")
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.getPost(id, requester_str))
    else:
        # Headers as specified in supergroup protocol
        headers = {"Client-Host": host, "User-ID": requester_str}
        response = instance_manager.get_post_by_id(external, id, headers)
        # return immediately for unsuccessful request
        if response[1] != 200:
            return response
        post = response[0]
        post['host'] = external
        
        return jsonify(post), response[1]

# Add a post to database or make request to do so on external server
@bp.route("/posts", methods=["POST"])
def create_post():
    if request.json is not None:
        external = request.json.get("external", None)
    else: external = None

    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if not host or not requester_str: return jsonify(client_host_error), 400
    # Validate json so that in correct form, reject otherwise
    if check_create_post(request.get_json(silent=True, force=True)): return check_create_post(request.get_json(silent=True, force=True))

    requester = User.lookup(requester_str)
    # If target server is external make call to manager instead of actions
    if external is None:
        message, status_code = verify_request(
            headers=request.headers, 
            request_target=f"post /fed/posts",
            body=request.data
        )
        if status_code != 200: return jsonify(message), status_code

        community_id = request.json["community"]
        if requester is None:
            community = Community.lookup(community_id)
            role = community.default_role
            # Check permissions of user making request
            if ((role != "member") & (role != "contributor") & (role != "admin")):
                message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                return jsonify(message), 403
        else :
            # Check site roles of user making request
            site_roles = requester.site_roles.split(",")
            if(("site-admin" not in site_roles) and ("site-moderator" not in site_roles)):
                if not requester.has_role(community_id, "member") :
                    message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                    return jsonify(message), 403

        return respond_with_action(actions.createPost(request.json, requester_str, host))
    else:
        # Headers as in supergroup protocol
        headers = {"Client-Host": host, "User-ID": requester_str}
        return instance_manager.create_post(external, request.json, headers)

# Edit post in database or make call to do so on external server
@bp.route("/posts/<id>", methods=["PUT"])
def edit_post(id):
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if not host or not requester_str: return jsonify(client_host_error), 400

    if request.json is not None:
        external = request.json.get("external", None)
    else: external = None

    # Validate json request meets schema
    if check_edit_post(request.get_json(silent=True, force=True)): return check_edit_post(request.get_json(silent=True, force=True))

    requester = User.lookup(requester_str)
    if(requester is None):
        message = {"title": "Permission Denied", "message": "Unknown user " + requester_str}
        return jsonify(message), 403

    if external is None:
        message, status_code = verify_request(
            headers=request.headers, 
            request_target=f"put /fed/posts",
            body=request.data
        )
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.editPost(id, request.json, requester))
    else:
        # Headers as in supergroup protocol
        headers = {"Client-Host": host, "User-ID": requester_str}
        return instance_manager.edit_post(external, request.json, id, headers)

# Delete post from database or make call for external server to do so
@bp.route("/posts/<id>", methods=["DELETE"])
def delete_post(id):
    if request.json is not None:
        external = request.json.get("external", None)
    else: external = None
    
    host = request.headers.get("Client-Host")
    requester_str = request.headers.get("User-ID")
    if not host or not requester_str: return jsonify(client_host_error), 400

    requester = User.lookup(requester_str)
    if external is None:
        message, status_code = verify_request(
            headers=request.headers, 
            request_target=f"delete /fed/posts/{id}",
            body=request.data
        )
        if status_code != 200: return jsonify(message), status_code

        return respond_with_action(actions.deletePost(id, requester))
    else:
        # Headers as in supergroup protocol
        headers = {"Client-Host": host, "User-ID": requester_str}
        return instance_manager.delete_post(external, request.json, id, headers)
