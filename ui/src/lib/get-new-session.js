const shuffle = require('lodash.shuffle')
const createStore = require('./create-store')

const participantId = createStore('participantId')
  .get()
  .toString()

const getAll = async db => {
  const data = await db.allDocs({ include_docs: true })
  return data.rows.map(row => row.doc)
}

const chooseNewSession = async (
  pouchParticipants,
  pouchSessions,
  pouchItems
) => {
  return Promise.all([
    getAll(pouchSessions),
    getAll(pouchParticipants),
    pouchParticipants.get(participantId),
  ]).then(([allSessions, allParticipants, loggedInParticipant]) => {
    const completedSessions = loggedInParticipant.completedSessions || []
    const possibleSessions = allSessions.filter(
      session => !completedSessions.includes(session._id)
    )

    const completedCounts = {}
    possibleSessions.forEach(session => (completedCounts[session._id] = 0))

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

    const minCompleted = Math.min(...Object.values(completedCounts), 0)
    const minCompletedSessions = Object.keys(completedCounts).filter(
      id => completedCounts[id] === minCompleted
    )

    const randomIndex = Math.floor(Math.random() * minCompletedSessions.length)

    return minCompletedSessions[randomIndex]
  })
}

const getItems = async (session, pouchItems) => {
  const itemIds = session.items
  const items = await Promise.all(itemIds.map(id => pouchItems.get(id)))
  return items
}

module.exports = async (pouchParticipants, pouchSessions, pouchItems) => {
  const newSessionId = await chooseNewSession(
    pouchParticipants,
    pouchSessions,
    pouchItems
  )
  const newSession = await pouchSessions.get(newSessionId)
  return {
    items: shuffle(await getItems(newSession, pouchItems)),
    index: 0,
    id: newSessionId,
  }
}
