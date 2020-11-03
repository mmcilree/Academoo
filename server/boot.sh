#!/bin/sh

python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt

cp ./deployment/nginx.conf /host/nnv2/nginx.d/default/backend.conf
nginx -c /host/nnv2/nginx.conf -s reload

flask db init
flask db upgrade

tmux kill-session -t CS3099
tmux new-session -d -s CS3099 "gunicorn -b :5000 backend:app"

