#!/bin/sh
# Sustituye SOLO ${BACKEND_URL} en el template nginx.
# Las variables nginx ($host, $uri, etc.) quedan intactas.
envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
