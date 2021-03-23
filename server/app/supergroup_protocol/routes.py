from app import actions, federation
from app.supergroup_protocol import bp
from flask import jsonify, request, Response, current_app
from app.models import User, Community
from utils import *
import json


def respond_with_action(actionResponse):
    data, status = actionResponse
    if data is None:
        return Response(status=status)
    else:
        return jsonify(data), status

@bp.route("/verify/<sig>", methods=["GET"])
def verify(sig):
    from app.digital_signatures import verify_signature
    sig = "t2ExjnL2sW1Kz9Kwg1mE2aIQW2UdybRKdZf0VGpJZkNJY0l9MHbvU8C6cjXfY2+WmOlWfaHdYBeRYlaMACXlOwdYedb0wdF+RDpuzCbS9p6CQwlAyWEStEZ7+msLCJvxSobJfDAGthbdeuYkuiX85JribDafZaBl1/maYwEBRBJYxc1vBnVwNg4kP5YrHv5xQaLoVKui6kFW41nW2vzVP1AvJsyuHmDftgMn0q69kfPPrAJrdpv41oHZGN7I7RJlSjrYZ0PVRDWI9KUlVM5c/wzKfoRTReZQJJxCAXA7knrvJFkCM+967KOG7dnRKzfd/PjjnfCMZhC4ROo5NlIiel5+mpUJ6P03/VumIniQhuMSctxeNoOsLlLf/cpfkD3JBlK0NWQMITeHB0ken+UirMIXy3/ZAWU+v8B2LIIsqSU5Br6VEtGiatggIaGXtg117o5Q+kKU84+kWK4GB4qpsBkySqWYJ00JuGM9FdCSBJ5LUUF/rTlghG6EpNfilAz4ruy4U92uzmrlmKyad5XlgjfH9r31gOrU/hrzmAa6s/wDktHCI2hF+c3XLu06MmyGZoZXQuboO7ab4ubMZvmFO43nLDQfOjJ0MZ2Fu2WHajnixcoGBvs4SmLoueDljRHKVnjriyNxylAmHlLpQZWtuJras+rdT8gib5coZjglgdg="
    verify_signature(sig, bytes(current_app.config["PUBLIC_KEY"], "utf-8"))

    return "Hello World"

@bp.route("/key", methods=["GET"])
def get_key():
    response = Response(current_app.config["PUBLIC_KEY"], mimetype="application/x-pem-file")
    return response

# User
@bp.route("/users", methods=["GET"])
def get_all_users():
    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getUserIDs())
    else:
        return federation.get_users(external)

@bp.route("/users/<id>", methods=["GET"])
def get_user_by_id(id):
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getLocalUser(id))
    else:
        return federation.get_users(external, id=id)

# Community
@bp.route("/communities", methods=["GET"])
def get_all_communities():
    host = request.headers.get("Client-Host")
    #if host is None:
    #    return Response(status = 400) #### remember to include json error message with it
    external = request.args.get("external")

    if not external:
        body, status = actions.getCommunityIDs()
        return respond_with_action(actions.getCommunityIDs())
    else:
        headers = {"Client-Host": host}
        return federation.get_communities(external, headers)

@bp.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    host = request.headers.get("Client-Host")
    #if host is None:
    #    return Response(status = 400)
    external = request.args.get("external")

    if not external:
        return respond_with_action(actions.getCommunity(id))
    else:
        headers = {"Client-Host": host}
        return federation.get_communities(external, headers, id=id)

@bp.route("/communities/<id>/timestamps")
def get_community_timestamps(id): # no option for federation?
    ##headers = request.headers['Client-Host']
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
        return respond_with_action(actions.getFilteredPosts(limit, community_id, min_date, author, host, parent_post, include_children, content_type, requester_str))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        response = federation.get_posts(external, community_id, headers)
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
        return respond_with_action(actions.getPost(id, requester_str))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        response = federation.get_post_by_id(external, id, headers)
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
        community_id = request.json["community"]
        #Permissions for comments as minimum
        if requester is None:
            community = Community.lookup(community_id)
            role = community.default_role
            if ((role != "member") & (role != "contributor") & (role != "admin")):
                message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                return jsonify(message), 403
        else :
            if not requester.has_role(community_id, "member") :
                message = {"title": "Permission error", "message": "Do not have permission to perform action"}
                return jsonify(message), 403
        
        return respond_with_action(actions.createPost(request.json, requester_str, host))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        return federation.create_post(external, request.json, headers)

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
        return respond_with_action(actions.editPost(id, request.json, requester))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        return federation.edit_post(external, request.json, id, headers)

@bp.route("/posts/<id>", methods=["DELETE"]) ################################### NO EXTERNAL FIELD FOR DELETING ON OTHER SERVERS :(
def delete_post(id):
    external = request.args.get("external")

    host = request.headers.get("Client-Host") 
    requester_str = request.headers.get("User-ID")
    #if host is None or requester_str is None:
    #    return Response(status = 400)

    requester = User.lookup(requester_str)
    if external is None:
        return respond_with_action(actions.deletePost(id, requester))
    else:
        headers = {"Client-Host": host, "User-ID": requester_str}
        return federation.delete_post(external, request.json, id, headers)
