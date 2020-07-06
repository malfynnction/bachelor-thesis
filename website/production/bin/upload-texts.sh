#! /usr/bin/env bash
curl -X POST localhost:5984/items/_bulk_docs -H 'Content-Type: application/json' -d @processed-texts/items.json 
curl -X POST localhost:5984/sessions/_bulk_docs -H 'Content-Type: application/json' -d @processed-texts/sessions.json

# TODO: this does not work if the DB (items bzw. sessions) does not exist or there are duplicate IDs
