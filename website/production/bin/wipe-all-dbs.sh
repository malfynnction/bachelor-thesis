#! /usr/bin/env bash

# load DB admin password from env
ENV_FILE="/home/adminuser/production/.env"
export $(cat $ENV_FILE | xargs)

encoded=$(echo "admin:${COUCHDB_PASSWORD}" | base64)
authentication="${encoded:0:$((${#encoded}-1))}="


for database in "items" "sessions" "participants" "ratings" "feedback" ; do
    curl -X DELETE http://localhost:5984/${database} -H "Authorization: Basic ${authentication}"
    curl -X PUT localhost:5984/${database} -H "Authorization: Basic ${authentication}"
done
