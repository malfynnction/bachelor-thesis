import shuffle from 'lodash.shuffle'
import createStore from './create-store'

const TRAINING_ID = 'Training'
const scammingParticipantIds = ['9', '13', '29', '41', '54', 'scammingTest']

const isSentenceSession = session =>
  session.items[0] && session.items[0].toString().startsWith('sent')

const getNextSessionFilter = completedSessionTypes => {
  // for every 9 paragraph sessions, there needs to be exactly 1 sentence session

  const paragraphAmount = completedSessionTypes.filter(
    sessionType => sessionType === 'paragraph'
  ).length
  const sentenceAmount = completedSessionTypes.filter(
    sessionType => sessionType === 'sentence'
  ).length
  const paragraphOverflow = paragraphAmount - sentenceAmount * 9
  if (paragraphOverflow < 0) {
    // next session needs to be a paragraph session
    return session => !isSentenceSession(session)
  } else if (paragraphOverflow >= 9) {
    // next session needs to be a sentence session
    return session => isSentenceSession(session)
  }
  return () => true
}

const chooseNewSession = async (
  pouchParticipants,
  pouchSessions,
  participantId
) => {
  const [
    allSessions,
    allParticipants,
    loggedInParticipant,
  ] = await Promise.all([
    pouchSessions.getAll(),
    pouchParticipants.getAll(),
    pouchParticipants.get(participantId),
  ])

  const completedSessions = loggedInParticipant.completedSessions || {}
  const completedSessionTypes = await Promise.all(
    Object.keys(completedSessions).map(async id => {
      try {
        const session = await pouchSessions.get(id)
        if (isSentenceSession(session)) {
          return 'sentence'
        }
        return 'paragraph'
      } catch (e) {
        console.error(e)
        return ''
      }
    })
  )
  const sessionTypeFilter = getNextSessionFilter(completedSessionTypes)
  const possibleSessions = allSessions
    .filter(
      session =>
        !Object.keys(completedSessions).includes(session._id) &&
        session._id !== TRAINING_ID
    )
    .filter(sessionTypeFilter)

  if (possibleSessions.length === 0) {
    return -1
  }

  const completedCounts = {}
  possibleSessions.forEach(session => (completedCounts[session._id] = 0))

  for (const participant of allParticipants) {
    if (scammingParticipantIds.includes(participant._id)) {
      continue
    }
    Object.keys(participant.completedSessions).forEach(completed => {
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
  isTraining,
  participantId
) => {
  let newSessionId

  if (!participantId) {
    const participantStore = createStore('participantId')
    participantId = participantStore.get()
  }

  if (isTraining) {
    const trainingSession = await pouchSessions.get(TRAINING_ID)
    if (trainingSession.status === 404) {
      newSessionId = await chooseNewSession(
        pouchParticipants,
        pouchSessions,
        participantId
      )
    } else {
      newSessionId = TRAINING_ID
    }
  } else {
    newSessionId = await chooseNewSession(
      pouchParticipants,
      pouchSessions,
      participantId
    )
  }

  if (newSessionId === -1) {
    return { finishedAllSessions: true }
  }

  let tries = 0
  while (tries < 5) {
    try {
      const newSession = await pouchSessions.get(newSessionId)
      const session = {
        items: shuffle(await getItems(newSession, pouchItems)),
        index: 0,
        id: newSessionId,
      }
      return session
    } catch (e) {
      console.error(`error getting session ${newSessionId}:`)
      console.error(e)
      tries++
      newSessionId = await chooseNewSession(
        pouchParticipants,
        pouchSessions,
        participantId
      )
    }
  }
  return { error: true }
}

export default getNewSession
