from flask import Blueprint

bp = Blueprint("protocol", __name__)

from app.supergroup_protocol import routes