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
      completedSessions: { 1: 'token' },
      completedTrainingSession: true,
    },
    {
      _id: 'inTraining',
      completedSessions: {},
      completedTrainingSession: false,
    },
  ],
  participantsWithManySessions: [
    {
      _id: '9ParagraphsCompleted',
      completedSessions: {
        2: 'token',
        3: 'token',
        4: 'token',
        5: 'token',
        6: 'token',
        7: 'token',
        8: 'token',
        9: 'token',
        10: 'token',
      },
      completedTrainingSession: true,
    },
    {
      _id: '1SentenceCompleted',
      completedSessions: {
        0: 'token',
        2: 'token',
        3: 'token',
        4: 'token',
        5: 'token',
        6: 'token',
        7: 'token',
        8: 'token',
        9: 'token',
      },
      completedTrainingSession: true,
    },
  ],
  participantsWithScam: [
    {
      _id: 'scammingTest',
      completedSessions: { 2: 'token' },
      completedTrainingSession: true,
    },
    {
      _id: 'scammingTest',
      completedSessions: { 2: 'token' },
      completedTrainingSession: true,
    },
    {
      _id: 'notScamming',
      completedSessions: {},
      completedTrainingSession: true,
    },
    {
      _id: 'notScamming2',
      completedSessions: { 1: 'token' },
      completedTrainingSession: true,
    },
  ],
  items: [{ _id: 'par_1' }, { _id: 'sent_1' }],
  sessions: [
    { _id: '1', items: [] },
    { _id: '2', items: [] },
    { _id: 'Training', items: [] },
  ],
  oneSession: [{ _id: '1', items: [] }],
  completeSetOfSessions: [
    { _id: '0', items: ['sent_1'] },
    { _id: '1', items: ['sent_1'] },
    { _id: '2', items: ['par_1'] },
    { _id: '3', items: ['par_1'] },
    { _id: '4', items: ['par_1'] },
    { _id: '5', items: ['par_1'] },
    { _id: '6', items: ['par_1'] },
    { _id: '7', items: ['par_1'] },
    { _id: '8', items: ['par_1'] },
    { _id: '9', items: ['par_1'] },
    { _id: '10', items: ['par_1'] },
  ],
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

it('ignores the completed surveys of scammers', () => {
  expect.assertions(1)
  return getSession({
    isTraining: false,
    participantId: 'notScamming',
    participants: data.participantsWithScam,
  }).then(result => expect(result.id).toEqual('2'))
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

it('returns a sentence session if 9 paragraph sessions have been done', () => {
  expect.assertions(1)
  return getSession({
    isTraining: false,
    participants: data.participantsWithManySessions,
    participantId: '9ParagraphsCompleted',
    sessions: data.completeSetOfSessions,
  }).then(result => {
    expect(result.items[0]._id).toEqual('sent_1')
  })
})

it('returns a paragraph session if a sentence session has already been done', () => {
  expect.assertions(1)
  return getSession({
    isTraining: false,
    participants: data.participantsWithManySessions,
    participantId: '1SentenceCompleted',
    sessions: data.completeSetOfSessions,
  }).then(result => {
    expect(result.items[0]._id).toEqual('par_1')
  })
})
