import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_praetorian import Praetorian

from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db = SQLAlchemy(app)
migrate = Migrate(app, db)


from app.models import User, Community, Post
guard = Praetorian()
guard.init_app(app, User)

from app import routes, models
app.register_blueprint(routes.bp, url_prefix="/" if os.environ.get("FLASK_ENV") == "production" else "/api")
