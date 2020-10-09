# Bachelor Thesis

** Note: ** Most of the functionality of the website, as well as automatic deployment, is currently disabled since the study is finished. To bring it back to working mode, merge the branch `reopen-study` into `main`.

## Requirements

- Docker
- Docker Compose

### Additional Development Requirements

- npm
- python

## Initial setup

- Fork the repository & clone it to your computer
- `npm install`
- `pip install -r requirements.txt`
- Adjust the config in `website/frontend/src/config.js` and `config.yml`
- Add necessary [GitHub Secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets-for-a-repository) to your repository for automatic deployment:
  - `CONTACT_MAIL`: Mail address for participants to contact you
  - `COUCHDB_PASSWORD`: Admin password for your CouchDB
  - `DOCKER_USERNAME` and `DOCKER_PASSWORD`: Your dockerhub credentials
  - `PRIVATE_SSH_KEY`: A private SSH key that can be used to access your server & run scripts via SSH
- [Populate database](#preprocessing)

## Local development

- `git pull`
- `npm install`
- `cd website && docker-compose up`
- go to [http://localhost:8000](http://localhost:8000)

## Testing

Unit tests can be run locally with `npm test`. They are also run automatically on every push to the repository.

## Deploys

The website is deployed automatically via github actions on every push to the `main` branch. The Docker Images for the frontend and backend are published on [dockerhub](https://hub.docker.com/u/malfynnction) and then started on the server via docker-compose (See `production` directory)

## Database

[CouchDB](https://couchdb.apache.org/) is used for the databases for this project. There are five databases:

- participants: All the demographic data on the participants will be stored here
- ratings: The answers the participants gave in the study will be stored here
- items: This is the main database for all the texts you want to have rated
- sessions: The texts will be grouped into "sessions" and will always appear grouped together according to the sessions stored in this database.
  - It is recommended to add a training session, so that participants can get familiar with the website before submitting actual ratings. For a training session, you can add a session with the ID "Training" to your DB. If no training session is declared in your database, a random session will be selected when a user requests to do a training session.
- feedback: all feedback from the participants will be saved here

The database is backed up automatically once a day via a cron job. The backups are stored on the server in `db-backups/`.

<a name='preprocessing'></a>

## Pre- & Postprocessing

The texts can be generated automatically by providing them in _TODO_ format. You can then run `python website/process_texts.py`, which will create two files in `data/texts`. You then need to upload this folder to your server (e.g. via `scp data/texts/* [YOUR_SERVER_HERE]:texts/`) and add them to your DB by running `production/bin/upload-texts.sh` on your server.

After the study the results can be downloaded and summarized by running `node data/index.js`

## Participant Sessions

If you plan on doing in-person sessions, you should make sure nothing is saved to the localStorage, to avoid data being exposed to participants sharing the same computer. This can be done by changing https://github.com/malfynnction/bachelor-thesis/blob/a75ed2ec0f8be9c2308a1aabd95cec1901236e44/website/frontend/src/lib/create-store.js#L2 to `const store = sessionStorage`.

For every submitted survey, a confirmation token is generated and given to the participants. They will use this token to prove that they completed the survey. You can check the validity of given tokens by inserting the participant ID and token in `data/check-legitimacy.js` and running that script with `node data/check-legitimacy.js`. This will not only check whether the tokens are valid, but also download all ratings that the participant has submitted, so you can check if their answers seem legitimate.
If you identify a participant as a scammer, you can paste their ID into `website/frontend/scamming-ids.json` so that it will be ignored for all further calculations and analysis.
