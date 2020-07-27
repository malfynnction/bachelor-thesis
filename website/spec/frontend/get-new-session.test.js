const getNewSession = require('../../frontend/src/lib/get-new-session').default
const pouchDB = require('../mocks/pouch-db')
const cloneDeep = require('lodash.clonedeep')

const data = {
  participants: [
    {
      _id: 'nothingCompleted',
      completedSessions: {},
      completedTrainingSession: true,
    },
    {
      _id: 'everythingCompleted',
      completedSessions: { '1': 'token' },
      completedTrainingSession: true,
    },
    {
      _id: 'inTraining',
      completedSessions: {},
      completedTrainingSession: false,
    },
  ],
  items: [{ _id: 'par_1' }, { _id: 'sent_1' }],
  sessions: [
    { _id: '1', items: [] },
    { _id: '2', items: [] },
    { _id: 'Training', items: [] },
  ],
  oneSession: [{ _id: '1', items: [] }],
}

const getSession = ({
  participants,
  sessions,
  items,
  isTraining,
  participantId,
}) => {
  return getNewSession(
    pouchDB(cloneDeep(participants || data.participants)),
    pouchDB(cloneDeep(sessions || data.sessions)),
    pouchDB(cloneDeep(items || data.items)),
    isTraining,
    participantId
  )
}

it('returns a new session', () => {
  expect.assertions(3)
  return getSession({
    isTraining: false,
    participantId: 'nothingCompleted',
    sessions: data.oneSession,
  }).then(result => {
    expect(result.items).toEqual([])
    expect(result.id).toEqual('1')
    expect(result.index).toEqual(0)
  })
})

it('returns the training session for participants in training', () => {
  expect.assertions(1)
  return getSession({ isTraining: true, participantId: 'inTraining' }).then(
    result => {
      expect(result.id).toEqual('Training')
    }
  )
})

it('returns a random session if no training session is defined', () => {
  expect.assertions(1)
  return getSession({
    isTraining: true,
    participantId: 'inTraining',
    sessions: data.oneSession,
  }).then(result => {
    expect(result.id).toEqual('1')
  })
})

it('returns the session with the least ratings', () => {
  expect.assertions(1)
  return getSession({
    isTraining: false,
    participantId: 'nothingCompleted',
  }).then(result => {
    expect(result.id).toEqual('2')
  })
})

it('returns a note if all sessions have been completed', () => {
  expect.assertions(1)
  return getSession({
    isTraining: false,
    participantId: 'everythingCompleted',
    sessions: data.oneSession,
  }).then(result => {
    expect(result).toEqual({ finishedAllSessions: true })
  })
})
