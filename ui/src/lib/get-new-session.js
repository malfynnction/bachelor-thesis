const shuffle = require('lodash.shuffle')
const newPouchDB = require('./new-pouch-db')
const createStore = require('./create-store')

const pouchSessions = newPouchDB('sessions')
const pouchParticipants = newPouchDB('participants')
const pouchItems = newPouchDB('items')

const participantId = createStore('participantId').get()

const chooseNewSession = () => {
  return '1' // TODO
}

const getItems = async session => {
  const itemIds = session.items
  const items = await Promise.all(itemIds.map(id => pouchItems.get(id)))
  return items
}

module.exports = async () => {
  const data = await pouchSessions.allDocs({ include_docs: true })
  const sessions = data.rows.map(row => row.doc)
  const newSessionId = chooseNewSession(sessions)
  const newSession = await pouchSessions.get(newSessionId)
  return { items: shuffle(await getItems(newSession)), index: 0 }
}
