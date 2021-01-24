from flask_praetorian.decorators import auth_required
from app import actions, federation
from app.main import bp
from flask import request, Response, jsonify
from flask_praetorian import current_user

@bp.route("/")
def index():
    return "Hello World!"

@bp.route("/assign-role", methods=["POST"])
def assign_role():
    req = request.json
    host = req["host"]
    user_id = req["user"]
    community_id = req["community"]
    role = req["role"]
    return Response(status=200) if actions.assignRole(host, user_id, community_id, role) else Response(status=400)

@bp.route("/set-default-role", methods=["POST"])
def set_default_role():
    req = request.json
    default_role = req["role"]
    community_id = req["community"]
    return Response(status=200) if actions.setDefaultRole(default_role, community_id) else Response(status=400)    

@bp.route("/create-community", methods=["POST"])
def create_community():
    req = request.json
    id = req["id"]
    title = req["title"]
    description = req["description"]
    admins = request.json["admins"].replace(" ", "").split(",")

    return Response(status=200) if actions.createCommunity(id, title, description, admins) else Response(status=400)

@bp.route("/get-user")
@auth_required
def get_user():
    u = current_user()
    adminOf = []
    for community in u.admin_of:
        adminOf.append(community.id)

    return jsonify({"id": u.user_id, "email": u.email, "host": u.host, "adminOf": adminOf})

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