const fs = require('fs')
const extractRatingsForParticipant = require('./extract-ratings-for-participant')

const resultsPath = './results'

const participants = JSON.parse(
  fs.readFileSync(`${resultsPath}/participants.json`)
)
const ratings = JSON.parse(fs.readFileSync(`${resultsPath}/ratings.json`))

const trainingItems = ['Training_simple', 'Training_average', 'Training_hard']
const deniedIDs = [
  '9',
  '10',
  '11',
  '13',
  '14',
  '21',
  '24',
  '25',
  '29',
  '41',
  '43',
  '50',
  '52',
  '54',
]
const emptyIDs = [
  '3',
  '6',
  '7',
  '15',
  '17',
  '23',
  '26',
  '27',
  '28',
  '31',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '42',
  '44',
  '45',
  '46',
  '48',
  '53',
  '58',
  '59',
]
const confirmedIDs = [
  '1',
  '2',
  '4',
  '5',
  '8',
  '12',
  '16',
  '18',
  '19',
  '20',
  '22',
  '30',
  '32',
  '33',
  '34',
  '47',
  '49',
  '51',
  '55',
  '56',
  '57',
  '60',
  '61',
  '62',
]

const printSurveyStats = () => {
  const completedSessions = participants.reduce((session, participant) => {
    return {
      ...session,
      [participant._id]: Object.keys(participant.completedSessions),
    }
  }, {})

  const totalSessions = Object.values(completedSessions).reduce(
    (count, curr) => count + curr.length,
    0
  )

  const confirmedSessions = Object.keys(completedSessions)
    .filter(id => {
      return confirmedIDs.includes(id)
    })
    .reduce((count, id) => count + completedSessions[id].length, 0)

  const possibleSessions = Object.keys(completedSessions)
    .filter(id => !deniedIDs.includes(id))
    .reduce((count, id) => count + completedSessions[id].length, 0)

  console.log('total sessions: ', totalSessions)
  console.log('confirmed sessions: ', confirmedSessions)
  console.log('possible sessions (includes unconfirmed): ', possibleSessions)
}

const printParticipantStats = () => {
  const totalUsers = participants.length
  const trainedUsers = participants.filter(p => p.completedTrainingSession)
    .length
  const usersWithSessions = participants.filter(
    p => Object.keys(p.completedSessions).length > 0
  ).length
  const unfinishedUsers = participants.filter(
    p =>
      !deniedIDs.includes(p._id) &&
      p.completedSessions &&
      Object.keys(p.completedSessions).length % 10 != 0
  )
  const uncheckedUsers = participants.filter(
    p => ![...emptyIDs, ...confirmedIDs, ...deniedIDs].includes(p._id)
  )

  console.log(
    `There were ${totalUsers} participants in total, out of which ${trainedUsers} completed the training, ${usersWithSessions} completed at least one survey and ${confirmedIDs.length} are confirmed to be legit.`,
    `${deniedIDs.length} participants have been identified as scammers and ${uncheckedUsers.length} still need to be checked. ${unfinishedUsers.length} can still complete sessions.`
  )
}

const checkMissingConfirmations = () => {
  const missingIds = participants
    .map(p => p._id)
    .filter(
      id =>
        !deniedIDs.includes(id) &&
        !confirmedIDs.includes(id) &&
        !emptyIDs.includes(id)
    )

  missingIds.forEach(id => extractRatingsForParticipant(id))
}

const extractUsableResults = () => {
  const usableParticipants = participants.filter(
    p =>
      !deniedIDs.includes(p._id) &&
      p.completedTrainingSession &&
      Object.keys(p.completedSessions).length > 0
  )
  const usableRatings = ratings.filter(
    rating =>
      !deniedIDs.includes(rating.participantId) &&
      !trainingItems.includes(rating.itemId)
  )
  return { ratings: usableRatings, participants: usableParticipants }
}

const extractScammingResults = () => {
  return ratings.filter(rating => deniedIDs.includes(rating.participantId))
}

module.exports = {
  confirmedIDs,
  deniedIDs,
  emptyIDs,
  extractUsableResults,
  extractScammingResults,
  checkMissingConfirmations,
}

// printSurveyStats()
// printParticipantStats()
