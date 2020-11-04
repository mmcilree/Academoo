#!/bin/sh

cp ./deployment/nginx.conf /host/nnv2/nginx.d/default/backend.conf
nginx -c /host/nnv2/nginx.conf -s reload

cd server && chmod +x boot.sh && ./boot.sh && cd ..
cd client && chmod +x boot.sh && ./boot.sh && cd ..

