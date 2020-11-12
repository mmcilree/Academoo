from app import actions, federation
from app.supergroup_protocol import bp
from flask import jsonify, request, Response

# Community
@bp.route("/communities", methods=["GET"])
def get_all_communities():
    return jsonify(actions.getCommunityIDs())

@bp.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    return jsonify(actions.getCommunity(id))

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
    return jsonify(actions.getPost(id))

@bp.route("/posts", methods=["POST"])
def create_post():
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