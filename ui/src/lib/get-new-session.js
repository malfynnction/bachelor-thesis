const shuffle = require('lodash.shuffle')
const newPouchDB = require('./new-pouch-db')
const createStore = require('./create-store')

const pouchSessions = newPouchDB('sessions')
const pouchParticipants = newPouchDB('participants')
const pouchItems = newPouchDB('items')

const participantId = createStore('participantId').get()

const getAll = async db => {
  const data = await db.allDocs({ include_docs: true })
  return data.rows.map(row => row.doc)
}

const chooseNewSession = async () => {
  return Promise.all([
    getAll(pouchSessions),
    getAll(pouchParticipants),
    pouchParticipants.get(participantId.toString()),
  ]).then(([allSessions, allParticipants, loggedInParticipant]) => {
    const completedSessions = loggedInParticipant.completedSessions || []
    const possibleSessions = allSessions.filter(
      session => !completedSessions.includes(session._id)
    )

    const completedCounts = {}
    for (const participant of allParticipants) {
      participant.completedSessions.forEach(completed => {
        const isPossible = possibleSessions.some(session => {
          return session._id === completed
        })
        if (isPossible) {
          completedCounts[completed] = (completedCounts[completed] || 0) + 1
        }
      })
    }

    const minCompleted = Math.min(...Object.values(completedCounts))
    const minCompletedSessions = Object.keys(completedCounts).filter(
      id => completedCounts[id] === minCompleted
    )

    const randomIndex = Math.floor(Math.random() * minCompletedSessions.length)
    return minCompletedSessions[randomIndex]
  })
}

const getItems = async session => {
  const itemIds = session.items
  const items = await Promise.all(itemIds.map(id => pouchItems.get(id)))
  return items
}

module.exports = async () => {
  const newSessionId = await chooseNewSession()
  const newSession = await pouchSessions.get(newSessionId)
  return { items: shuffle(await getItems(newSession)), index: 0 }
}
