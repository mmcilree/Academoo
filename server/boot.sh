#!/bin/sh

python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt

flask db init
flask db upgrade

echo "Starting tmux session for backend"

kill $(lsof -t -i:5000)
kill $(lsof -t -i:22875)
tmux kill-session -t CS3099-backend
tmux new-session -d -s CS3099-backend "export FLASK_ENV=production; gunicorn --log-level debug -k eventlet --workers=1 -b :22875 backend:app"

