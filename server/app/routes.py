from flask import json, g, request
from app import app, db

# Community
@app.route("/communities", methods=["GET"])
def get_all_communities():
    return "All Communities"

@app.route("/communities/<id>", methods=["GET"])
def get_community_by_id(id):
    return id

# Posts
@app.route("/posts", methods=["GET"])
def get_all_posts():
    return "All Posts"

@app.route("/posts/<id>", methods=["GET"])
def get_post_by_id(id):
    return id

@app.route("/posts", methods=["POST"])
def create_post():
    pass

@app.route("/posts/<id>", methods=["PUT"])
def edit_post(id):
    pass

@app.route("/posts/<id>", methods=["DELETE"])
def delete_post(id):
    pass