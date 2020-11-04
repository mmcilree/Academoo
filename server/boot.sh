#!/bin/sh

python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt

flask db init
flask db upgrade

tmux kill-session -t CS3099-backend
tmux new-session -d -s CS3099-backend "gunicorn -b :5000 backend:app"

