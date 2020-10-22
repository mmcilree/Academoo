from .middlewares import login_required
from flask import Flask, json, g, request
from flask_cors import CORS

# React frontend should use axios to communicate with the backend
app = Flask(__name__)
CORS(app)

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

@app.route("posts/<id>", methods=["DELETE"])
def delete_post(id):
    pass

if __name__ == "__main__":
    app.run()