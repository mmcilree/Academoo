#!/bin/sh

echo "Starting tmux session for frontend"

kill $(lsof -t -i:3000)
kill $(lsof -t -i:21767)
tmux kill-session -t CS3099-frontend
tmux new-session -d -s CS3099-frontend "npm install && npm run build && node_modules/serve/bin/serve.js -s build -l 21767"
# tmux new-session -d -s CS3099-frontend "npm install && npm run build && npm start"

