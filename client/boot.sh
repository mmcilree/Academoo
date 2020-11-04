#!/bin/sh

tmux kill-session -t CS3099-frontend
tmux new-session -d -s CS3099-frontend "npm install && npm start"

