from flask import jsonify, g, request, Response
from app import app, db, actions

# TODO: Error handling with invalid data
# TODO: Testing

@app.route("/")
def index():
    return "Hello World! The backend server is currently active."

# Community
@app.route("/fed/communities", methods=["GET"])
def get_all_communities():
    return jsonify(actions.getCommunityIDs())

@app.route("/fed/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    return jsonify(actions.getCommunity(id))

@app.route("/fed/communities/<id>/timestamps")
def get_community_timestamps(id):
    return jsonify(actions.getAllCommunityPostsTimeModified(id))

# Posts
@app.route("/fed/posts/", methods=["GET"])
def get_all_posts():
    # limit, community, min_date
    limit = int(request.args.get("limit", 20))
    community = request.args.get("community")
    min_date = request.args.get("min_date", 0)

    return jsonify(actions.getFilteredPosts(limit, community, min_date))

@app.route("/fed/posts/<id>", methods=["GET"])
def get_post_by_id(id):
    return jsonify(actions.getPost(id))

@app.route("/fed/posts", methods=["POST"])
def create_post():
    actions.createPost(request.json)

    return Response(status = 200)

@app.route("/fed/posts/<id>", methods=["PUT"])
def edit_post(id):
    actions.editPost(id, request.json)

    return Response(status = 200)

@app.route("/fed/posts/<id>", methods=["DELETE"])
def delete_post(id):
    actions.deletePost(id)

    return Response(status = 200)