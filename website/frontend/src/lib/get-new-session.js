import shuffle from 'lodash.shuffle'
import createStore from './create-store'

const participantId = (createStore('participantId').get() || '').toString()

const TRAINING_ID = 'Training'

const chooseNewSession = async (pouchParticipants, pouchSessions) => {
  return Promise.all([
    pouchSessions.getAll(),
    pouchParticipants.getAll(),
    pouchParticipants.get(participantId),
  ]).then(([allSessions, allParticipants, loggedInParticipant]) => {
    const completedSessions = loggedInParticipant.completedSessions || []
    const possibleSessions = allSessions.filter(
      session =>
        !completedSessions.includes(session._id) && session._id !== 'Training'
    )

    if (possibleSessions.length === 0) {
      return -1
    }

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

    const minCompleted = Math.min(...Object.values(completedCounts)) || 0
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

const getNewSession = async (
  pouchParticipants,
  pouchSessions,
  pouchItems,
  isTraining
) => {
  let newSessionId

  if (isTraining) {
    const trainingSession = await pouchSessions.get(TRAINING_ID)
    if (trainingSession.status === 404) {
      newSessionId = await chooseNewSession(pouchParticipants, pouchSessions)
    } else {
      newSessionId = TRAINING_ID
    }
  } else {
    newSessionId = await chooseNewSession(
      pouchParticipants,
      pouchSessions,
      pouchItems
    )
  }

  if (newSessionId === -1) {
    return { finishedAllSessions: true }
  }

  const newSession = await pouchSessions.get(newSessionId)
  return {
    items: shuffle(await getItems(newSession, pouchItems)),
    index: 0,
    id: newSessionId,
  }
}

export default getNewSession
