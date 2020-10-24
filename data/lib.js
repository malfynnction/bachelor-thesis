const extractRatingsForParticipant = require('./extract-ratings-for-participant')
const fs = require('fs')
const { exec } = require('child_process')
const yaml = require('js-yaml')
const scammingIDs = require('../website/frontend/src/scamming-ids.json')

const config = yaml.safeLoadAll(fs.readFileSync('../config.yml', 'utf-8'))[0]

const resultsPath = './results'
const serverUrl = config.ssh_access

const trainingItems = ['Training_simple', 'Training_average', 'Training_hard']

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

const getOrDownload = async (name, options = {}) => {
  const filePath = `${resultsPath}/${name}.json`

  if (!options.forceDownload && fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath))
  }

  const command = `curl -s localhost:5984/${name}/_all_docs?include_docs=true -o ${name}.json`

  const result = await new Promise(resolve => {
    exec(
      `ssh ${serverUrl} ${command} && scp ${serverUrl}:${name}.json ${filePath} && ssh ${serverUrl} rm ${name}.json`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`)
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`)
        }
        console.log(stdout)
        resolve(JSON.parse(fs.readFileSync(filePath)))
      }
    )
  })

  const parsedResult = result.rows.map(row => row.doc)
  // write to file for easier retrieval next time
  fs.writeFileSync(filePath, JSON.stringify(parsedResult))
  return parsedResult
}

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
    scammers: scammingIDs.length,
    confirmed: confirmedIDs.length,
  }
}

const checkMissingConfirmations = async () => {
  const participants = await getOrDownload('participants')
  const missingIds = participants
    .map(p => p._id)
    .filter(
      id =>
        !scammingIDs.includes(id) &&
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
      !scammingIDs.includes(p._id) &&
      p.completedTrainingSession &&
      Object.keys(p.completedSessions).length > 0
  )
  const usableRatings = ratings.filter(
    rating =>
      !scammingIDs.includes(rating.participantId) &&
      !trainingItems.includes(rating.itemId)
  )
  return { ratings: usableRatings, participants: usableParticipants }
}

const extractScammingResults = async () => {
  const ratings = await getOrDownload('ratings')
  return ratings.filter(rating => scammingIDs.includes(rating.participantId))
}

module.exports = {
  confirmedIDs,
  scammingIDs,
  emptyIDs,
  extractUsableResults,
  extractScammingResults,
  checkMissingConfirmations,
  getParticipantStats,
  getOrDownload,
}

getParticipantStats()
