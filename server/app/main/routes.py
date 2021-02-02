import re
from flask_praetorian.decorators import auth_required
from app import actions, federation
from app.main import bp
from flask import request, Response, jsonify
from flask_praetorian import current_user, auth_required

@bp.route("/")
def index():
    return "Hello World!"

@bp.route("/create-community", methods=["POST"])
def create_community():
    req = request.json
    id = req["id"]
    title = req["title"]
    description = req["description"]
    admins = request.json["admins"].replace(" ", "").split(",")

    return Response(status=200) if actions.createCommunity(id, title, description, admins) else Response(status=400)

@bp.route("/update-bio", methods=["POST"])
@auth_required
def update_bio():
    req = request.json
    bio = req["bio"]
    u=current_user()

    return Response(status=200) if actions.updateBio(u.user_id, bio) else Response(status=400)

@bp.route("/change-password", methods=["POST"])
@auth_required
def change_password():
    req = request.json
    username = current_user().user_id
    old_password = req["old_password"]
    new_password = req["new_password"]

    return Response(status=200) if actions.changePassword(username, old_password, new_password) else Response(status=400)

@bp.route("/get-user")
@auth_required
def get_user():
    u = current_user()
    return jsonify({"id": u.user_id, "email": u.email, "host": u.host, "bio": u.bio})

@bp.route("/add-instance", methods=["POST"])
def add_instance():
    req = request.json
    host = req["host"]
    url = req["url"]

    federation.add_instance(host, url)

    return Response(status=200)

@bp.route("/get-instances", methods=["GET"])
def get_all_instances():
    return jsonify(federation.get_instances())