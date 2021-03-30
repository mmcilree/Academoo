import re
from flask_praetorian.decorators import auth_required, roles_required, roles_accepted
from app import actions, instance_manager, socketio
from app.main import bp
from flask import request, Response, jsonify, current_app, redirect, url_for
from flask_praetorian import current_user
from flask_socketio import join_room, leave_room, send
from utils import *

BAD_REQUEST = ({"message": "Bad Request"}, 400)

def respond_with_action(actionResponse):
    data, status = actionResponse
    return jsonify(data), status

@bp.route("/")
def index():
    return "Hello World!"

@bp.route("/assign-role", methods=["POST"])
# @roles_accepted("site-admin, site-moderator")
def assign_role():
    req = request.json
    user_host = req["host"] #someday
    user_id = req["user"]
    community_id = req["community"]
    role = req["role"]
    current_user = request.headers.get("User-ID") # NOTE: shouldn't we use auth required and get user from there instead?
    if user_host in ["local", "nnv2host"]:
        return respond_with_action(actions.grantRole(user_id, community_id, current_user, role))
    else:
        return respond_with_action(actions.grantRole(user_id, community_id, current_user, role, True, user_host))

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

@bp.route("/add-site-role", methods=["POST"])
@auth_required
def add_sitewide_role():
    req = request.json
    if not req: return BAD_REQUEST

    try:
        admin = req["admin"]
        username = req["username"]
        key = req["key"]
        role = req["role"]
        host = req["host"]
    except KeyError: return BAD_REQUEST

    return respond_with_action(actions.addSiteWideRole(admin, username, role, key, host))

@bp.route("/remove-site-roles", methods=["PUT"])
@roles_required("site-admin")
def remove_site_roles():
    req = request.json
    if not req: return BAD_REQUEST
    
    try:
        username = req["username"]
        host = req["host"]
    except KeyError: return BAD_REQUEST
    return respond_with_action(actions.removeSiteWideRoles(username, host))

@bp.route("/account-activation", methods=["PUT"])
@roles_accepted("site-moderator", "site-admin")
def account_activation():
    req = request.json
    if not req: return BAD_REQUEST

    try:
        username = req["username"]
        host = req["host"]
        activation = req["activation"]
    except KeyError: return BAD_REQUEST
    return respond_with_action(actions.userAccountActivation(username, host, activation))

@bp.route("/create-community", methods=["POST"])
def create_community():
    req = request.json
    if not req: return BAD_REQUEST

    try:
        community_id = req["id"]
        title = req["title"]
        description = req["description"]
        admin = req["admin"]
    except KeyError: return BAD_REQUEST
    
    return respond_with_action(actions.createCommunity(community_id, title, description, admin))
    
@bp.route("/update-bio", methods=["POST"])
@auth_required
def update_bio():
    req = request.json
    if not (req and "bio" in req): return BAD_REQUEST

    bio = req["bio"]
    u = current_user()

    return Response(status=200) if actions.updateBio(u.user_id, bio) else BAD_REQUEST

@bp.route("/update-privacy", methods=["POST"])
@auth_required
def update_privacy():
    req = request.json
    if not (req and "private" in req): return BAD_REQUEST

    private = req["private"]
    u = current_user()

    return Response(status=200) if actions.updatePrivacy(u.user_id, private) else BAD_REQUEST

@bp.route("/change-password", methods=["POST"])
@auth_required
def change_password():
    req = request.json
    if not (req and "old_password" in req and "new_password" in req): return BAD_REQUEST

    username = current_user().user_id
    old_password = req["old_password"]
    new_password = req["new_password"]

    return Response(status=200) if actions.changePassword(username, old_password, new_password) else BAD_REQUEST

@bp.route("/get-user")
@auth_required
def get_user():
    u = current_user()
    adminOf = []
    subscriptions = []

    for userRole in u.roles:
        if(userRole.role == "admin"):
            adminOf.append(userRole.community_id)   

    for subscription in u.subscriptions:
        subscriptions.append({"communityId": subscription.community_id, "external": subscription.external})

    return jsonify({"id": u.user_id, "email": u.email, "host": u.host, "adminOf": adminOf, "subscriptions": subscriptions, "about": u.about, "private": u.private_account, "site_roles": u.site_roles})

@bp.route("/subscribe", methods=["POST"])
@auth_required
def subscribe():
    u = current_user()
    req = request.json
    community_id = req["id"]
    external = req["external"]
    return respond_with_action(actions.addSubscriber(u.user_id, community_id, external))

@bp.route("/unsubscribe", methods=["POST"])
@auth_required
def unsubscribe():
    u = current_user()
    req = request.json
    community_id = req["id"]
    external = req["external"]
    return respond_with_action(actions.removeSubscriber(u.user_id, community_id, external))

@bp.route("/add-instance", methods=["POST"])
def add_instance():
    req = request.json
    host = req["host"]
    url = req["url"]

    return Response(status=200) if instance_manager.add_instance(host, url) else BAD_REQUEST

@bp.route("/get-instances", methods=["GET"])
def get_all_instances():
    return jsonify(instance_manager.get_instances())

@bp.route("/delete-account", methods=["POST"])
@auth_required
def delete_user():
    req = request.json
    username = current_user().user_id
    password = req["password"]
    return Response(status=200) if actions.deleteUser(username, password) else BAD_REQUEST

@bp.route("/post-vote/<post_id>")
@auth_required
def post_vote(post_id):
    choice = request.args['vote']
    username = current_user().user_id
    if choice == "upvote":
        return respond_with_action(actions.upvotePost(username, post_id))
    else:
        return respond_with_action(actions.downvotePost(username, post_id))

@bp.route("/get-vote/<post_id>")
@auth_required
def get_vote(post_id):
    username = current_user().user_id
    return respond_with_action(actions.getVote(username, post_id))  

@bp.route("/add-post-tag/<post_id>", methods=['POST'])
@auth_required
def add_post_tag(post_id):
    tag_name = request.args['tag']
    return respond_with_action(actions.addTag(post_id, tag_name))

@bp.route("/delete-post-tag/<post_id>", methods=['DELETE'])
@auth_required
def delete_post_tag(post_id):
    tag_name = request.args['tag']
    return respond_with_action(actions.deleteTag(post_id, tag_name))

@bp.route("/get-post-tags/<post_id>", methods=["GET"])
@auth_required
def get_post_tags(post_id):
    return respond_with_action(actions.getPostTags(post_id))

@bp.route("/toggle-security", methods=["GET"])
def toggle_security():
    current_app.config["SIGNATURE_FEATURE"] = not current_app.config["SIGNATURE_FEATURE"]

    return str(current_app.config["SIGNATURE_FEATURE"])

@bp.route("/update-instances")
def update_instances():
    instance_manager.discover_instances()

    return redirect(url_for("protocol.discover"))

@socketio.on('join')
def on_join(data):
    username = data['user']
    room = data['room']
    join_room(room)
    print(username + ' has entered the room.')
    send(username + ' has entered the room.', room=room)

@socketio.on('leave')
def on_leave(data):
    username = data['user']
    room = data['room']
    leave_room(room)
    send(username + ' has left the room.', room=room, include_self=False)

@socketio.on('message')
def on_message(data):
    message = data['message']
    room = data['room']
    print(message)
    send(message, room=room)
