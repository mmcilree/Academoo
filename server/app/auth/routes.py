from flask import request, Response
from app.auth import bp
from app import actions, guard
from flask_praetorian import auth_required, current_user

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