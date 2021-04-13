import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_praetorian import Praetorian, current_user
from app.federation.manager import Manager
from flask_socketio import SocketIO

from config import Config

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db = SQLAlchemy()
migrate = Migrate(compare_type=True)
guard = Praetorian()
instance_manager = Manager(app.config["HOST"])
socketio = SocketIO()



from app.models import User

 
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    guard.init_app(app, User)
    instance_manager.discover_instances()
    
    if not app.config["TESTING"]:
        socketio.init_app(app, cors_allowed_origins="*")
        if os.environ.get("FLASK_ENV") != "production": socketio.run(app)

    url_prefix = "/" if os.environ.get("FLASK_ENV") == "production" else "/api"

    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix=url_prefix)

    from app.main import bp as main_bp
    app.register_blueprint(main_bp, url_prefix=url_prefix)

    from app.supergroup_protocol import bp as protocol_bp
    app.register_blueprint(protocol_bp, url_prefix=url_prefix)

    return app

from app import models
