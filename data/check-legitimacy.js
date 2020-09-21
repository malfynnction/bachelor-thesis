const extractRatingsForParticipant = require('./extract-ratings-for-participant')
const { getOrDownload } = require('./lib')

// adjust these to your needs
const participantId = '1'
const confirmationTokens = ['token 1', 'token 2']

const main = async () => {
  const participants = await getOrDownload('participants')
  const participant = participants.find(p => p._id === participantId)
  const actualTokens = Object.values(participant.completedSessions)

  if (confirmationTokens.every(token => actualTokens.includes(token))) {
    console.log('👍🏻 All provided confirmation tokens are valid.')
  } else {
    console.log('The following confirmation tokens are not valid:')
    console.log(
      confirmationTokens.filter(token => !actualTokens.includes(token))
    )
    console.log(
      "⚠️  Please check that you entered the correct participant ID and that the confirmation tokens are entered as a list of separate strings. Make sure you have downloaded the most recent results - if you're not sure, you can run `node download-raw-results.js`"
    )
  }
  extractRatingsForParticipant(participantId)
}

main()
