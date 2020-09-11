# Bachelor Thesis

_TODO: write a proper README_

## Requirements

- Docker
- Docker Compose

### Development Requirements

- npm
- python

## Initial setup

- Fork the repository & clone it to your computer
- `npm install`
- `python3 -m venv ./venv && source venv/bin/activate && pip install -r requirements.txt`
- Adjust the config in `frontend/src/config.js` and `config.yml`
- Add necessary [GitHub Secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) to your repository:
  - `CONTACT_MAIL`: Mail address for participants to contact you
  - `COUCHDB_PASSWORD`: Admin password for your CouchDB
  - `DOCKER_USERNAME` and `DOCKER_PASSWORD`: Your dockerhub credentials
  - `PRIVATE_SSH_KEY`: _(TODO explanation)_
- [Populate database](#database)

## Local development

- `git pull`
- `npm install`
- `docker-compose -f website/docker-compose.yml up`
- go to [http://localhost:8000](http://localhost:8000)

## Testing

_TODO_

## Deploys

The website is deployed automatically via github actions on every push to the `main` branch. The Docker Images for the frontend and backend are published on [dockerhub](https://hub.docker.com/u/malfynnction) and then started on the server via docker-compose (See `production` directory)

<a name='database'></a>

## Database

[CouchDB](https://couchdb.apache.org/) is used for the databases for this project. There are five databases:

- participants: All the demographic data on the participants will be stored here
- ratings: The answers the participants gave in the study will be stored here
- items: This is the main database for all the texts you want to have rated
- sessions: The texts will be grouped into "sessions" and will always appear grouped together according to the sessions stored in this database.
  - It is recommended to add a training session, so that participants can get familiar with the website before submitting actual ratings. For a training session, you can add a session with the ID "Training" to your DB. If no training session is declared in your database, a random session will be selected when a user requests to do a training session.
- feedback: all feedback from the participants will be saved here

The `item` and `session` docs can be generated automatically by providing your texts in _TODO_ format and then running `npm run process-texts`. This will create two files in `data/texts`. You then need to upload this folder to your server (e.g. via `scp data/texts/* [YOUR_SERVER_HERE]:texts/`) and add them to your DB by running `production/bin/upload-texts.sh` on your server.

After the study the ratings, the submitted feedback, and the participant demographics can be downloaded by requesting /api/results, the results will then be returned in _TODO_ format.
