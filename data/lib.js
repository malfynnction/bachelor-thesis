const extractRatingsForParticipant = require('./extract-ratings-for-participant')
const getOrDownload = require('./get-or-download')

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

const getParticipantStats = async () => {
  const participants = await getOrDownload('participants')
  const totalParticipants = participants.length
  const completedTrainingSession = participants.filter(
    p => p.completedTrainingSession
  ).length
  const completedSurveys = participants.filter(
    p => Object.keys(p.completedSessions).length > 0
  ).length

  return {
    totalParticipants,
    completedTrainingSession,
    completedSurveys,
    scammers: deniedIDs.length,
    confirmed: confirmedIDs.length,
  }
}

const checkMissingConfirmations = async () => {
  const participants = await getOrDownload('participants')
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

const extractUsableResults = async () => {
  const participants = await getOrDownload('participants')
  const ratings = await getOrDownload('ratings')
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

const extractScammingResults = async () => {
  const ratings = await getOrDownload('ratings')
  return ratings.filter(rating => deniedIDs.includes(rating.participantId))
}

module.exports = {
  confirmedIDs,
  deniedIDs,
  emptyIDs,
  extractUsableResults,
  extractScammingResults,
  checkMissingConfirmations,
  getParticipantStats,
}

getParticipantStats()
