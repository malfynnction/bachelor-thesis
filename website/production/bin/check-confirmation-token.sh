#! /usr/bin/env bash

# load DB admin password from env
ENV_FILE="/home/adminuser/production/.env"
export $(cat $ENV_FILE | xargs)

encoded=$(echo "admin:${COUCHDB_PASSWORD}" | base64)
authentication="${encoded:0:$((${#encoded}-1))}="

echo "Please enter the participant ID: "
read participant_id
participant=$(curl -s http://localhost:5984/participants/${participant_id} -H "Authorization: Basic ${authentication}")

echo "Please enter a confirmation token for this participant: "
read token
while [[ $token != "end" ]]
do 
    regex_token="\\\"[0-9]*\\\":\\\"$token\\\""
    match=$(echo $participant | grep -o "$regex_token")

    regex_session_id="\\\"[0-9]*\\\""
    session_id=$(echo $match | grep -o "$regex_session_id")

    if [[ $session_id ]]; then
    echo "👍🏻 This is the valid confirmation token for session $session_id";
    else
    echo "👎🏻 This token is not valid.";
    fi

    echo "Please enter another confirmation token or type 'end' to end the process: "
    read token
done
