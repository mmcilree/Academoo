from flask import jsonify, g, request, Response, Blueprint
from app import app, db, actions, guard
from flask_praetorian import auth_required, current_user

# TODO: Error handling with invalid data
# TODO: Testing

bp = Blueprint("bp", __name__)

@bp.route("/")
def index():
    return "Hello World! The backend server is currently active."

@bp.route("/register", methods=["POST"])
def register():
    req = request.json
    email = req.get('email')
    password = req.get('password')

    return Response(status=200) if actions.createUser(email, password) else Response(status=400)

@bp.route("/login", methods=["POST"])
def login():
    req = request.json
    email = req.get('email')
    password = req.get('password')

    user = guard.authenticate(email, password)
    return {'access_token': guard.encode_jwt_token(user)}

@bp.route("/refresh", methods=["POST"])
def refresh():
    _, old_token = request.headers["Authorization"].split(" ")
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200

@bp.route("/protected")
@auth_required
def protected():
    return f"Congrats, you've logged in to {current_user().email}"

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

    return jsonify(actions.getFilteredPosts(limit, community, min_date))

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