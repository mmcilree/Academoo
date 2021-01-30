from app import actions, federation
from app.supergroup_protocol import bp
from flask import jsonify, request, Response
from app.models import User, Community

# User
@bp.route("/users", methods=["GET"])
def get_all_users():
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getUserIDs())
    else:
        return jsonify(federation.get_users(external))

@bp.route("/users/<id>", methods=["GET"])
def get_user_by_id(id):
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getUser(id))
    else:
        return jsonify(federation.get_users(external, id=id))

# Community
@bp.route("/communities", methods=["GET"])
def get_all_communities():
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getCommunityIDs())
    else:
        return jsonify(federation.get_communities(external))

@bp.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getCommunity(id))
    else:
        return jsonify(federation.get_communities(external, id=id))

@bp.route("/communities/<id>/timestamps")
def get_community_timestamps(id):
    return jsonify(actions.getAllCommunityPostsTimeModified(id))

# Posts
@bp.route("/posts", methods=["GET"])
def get_all_posts():
    # limit, community, min_date
    limit = int(request.args.get("limit", 20))
    community = request.args.get("community")
    min_date = request.args.get("min_date", 0)

    external = request.args.get("external")

    if not external:
        return jsonify(actions.getFilteredPosts(limit, community, min_date))
    else:
        return jsonify(federation.get_posts(external, community))

@bp.route("/posts/<id>", methods=["GET"])
def get_post_by_id(id):
    external = request.args.get("external")

    if not external:
        return jsonify(actions.getPost(id))
    else:
        return jsonify(federation.get_post_by_id(external, id))

@bp.route("/posts", methods=["POST"])
def create_post():
    host = request.json.get("external")
    user_id = request.headers.get("UserIDHeader")
    user = User.lookup(user_id)
    community_id = request.json["parent"]

    if user.has_no_role(community_id):
        community = Community.lookup(community_id)
        role = community.get_default_role(community_id)
        if ((role != "contributor") & (role != "admin")):
            return Response(status = 403)
    else :
        if not user.has_role(community_id, "contributor"):
            return Response(status = 403)

    if host:
        federation.create_post(host, request.json)
    else:
        actions.createPost(request.json)

    return Response(status = 200)

@bp.route("/posts/<id>", methods=["PUT"])
def edit_post(id):
    actions.editPost(id, request.json)

    return Response(status = 200)

@bp.route("/posts/<id>", methods=["DELETE"])
def delete_post(id):
    actions.deletePost(id)

    return Response(status = 200)
