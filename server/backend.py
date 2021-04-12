import eventlet
eventlet.monkey_patch()
from app import create_app

app = create_app()
