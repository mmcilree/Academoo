from flask import request, Response, jsonify
from app.auth import bp
from app import actions, guard
from flask_praetorian import auth_required, current_user
from utils import *

def respond_with_action(actionResponse):
    data, status = actionResponse
    return jsonify(data), status

@bp.route("/register", methods=["POST"])
def register():
    req = request.json
    username = req.get('username')
    email = req.get('email')
    password = req.get('password')

    return respond_with_action(actions.createUser(username, email, password))

@bp.route("/login", methods=["POST"])
def login():
    req = request.json
    username = req.get('username')
    password = req.get('password')

    user = guard.authenticate(username, password)
    return {'access_token': guard.encode_jwt_token(user)}

@bp.route("/refresh", methods=["POST"])
def refresh():
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200

@bp.route("/protected")
@auth_required
def protected():
    return f"Congrats, you've logged in to {current_user().user_id}"