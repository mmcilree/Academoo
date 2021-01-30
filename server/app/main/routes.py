import re
from flask_praetorian.decorators import auth_required
from app import actions, federation
from app.main import bp
from flask import request, Response, jsonify
from flask_praetorian import current_user

def respond_with_action(actionResponse):
    data, status = actionResponse
    return jsonify(data), status

@bp.route("/")
def index():
    return "Hello World!"

@bp.route("/assign-role", methods=["POST"])
def assign_role():
    req = request.json
    host = req["host"] #someday
    user_id = req["user"]
    community_id = req["community"]
    role = req["role"]
    return respond_with_action(actions.grantRole(user_id, community_id, role))

@bp.route("/set-default-role", methods=["POST"])
def set_default_role():
    req = request.json
    default_role = req["role"]
    community_id = req["community"]
    return respond_with_action(actions.setDefaultRole(default_role, community_id))  

@bp.route("/get-default-role/<id>", methods=["GET"])
def get_default_role(id):
    return respond_with_action(actions.getDefaultRole(id))

@bp.route("/get-community-roles/<id>", methods=["GET"])
def get_community_roles(id):
    return respond_with_action(actions.getRoles(id))

@bp.route("/create-community", methods=["POST"])
def create_community():
    req = request.json
    id = req["id"]
    title = req["title"]
    description = req["description"]
    admin = req["admin"]

    return respond_with_action(actions.createCommunity(id, title, description, admin))

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
    adminOf = []
    for userRole in u.roles:
        if(userRole.role("admin")):
            adminOf.append(userRole.community.id)    

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