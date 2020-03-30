# Bachelor Thesis

_TODO: write a proper README_

## Requirements

- Docker
- Docker Compose

## Initial setup

- `git clone https://github.com/malfynnction/bachelor-thesis.git && cd bachelor-thesis`
- `npm install`
- `python3 -m venv ./venv && source venv/bin/activate && pip install -r requirements.txt`
- [Populate database](#database)

## Local development

- `git pull`
- `npm install`
- `docker-compose -f website/docker-compose-dev.yml up`
- go to [http://localhost:8000](http://localhost:8000)
- happy editing!

## Testing

_TODO_

## Deploys

_TODO_

<a name='database'></a>

## Database

[CouchDB](https://couchdb.apache.org/) is used for the databases for this project. There are four databases:

- participants: All the demographic data on the participants will be stored here
- ratings: The answers the participants gave in the study will be stored here
- items: This is the main database for all the texts you want to have rated
- sessions: The texts will be grouped into "sessions" and will always appear grouped together according to the sessions stored in this database.
  - It is recommended to add a training session, so that participants can get familiar with the website before submitting actual ratings. For a training session, you need to _TODO_. If no training session is declared in your database, a random session will be selected when a user requests to do a training session.

They can be populated automatically by providing your texts in _TODO_ format and then running `npm run process-texts`.
After the study, the ratings and participant demographics can be downloaded by running `node website/download-ratings.js`, the results will then be saved in _TODO_ format.
