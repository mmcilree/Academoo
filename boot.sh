#!/bin/sh

cp ./deployment/nginx.conf /host/cs3099user-a1/nginx.d/default/CS3099.conf
nginx -c /host/cs3099user-a1/nginx.conf -s reload

cd server && chmod +x boot.sh && sh boot.sh && cd ..
cd client && chmod +x boot.sh && sh boot.sh && cd ..

