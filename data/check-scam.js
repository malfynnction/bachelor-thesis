const fs = require('fs')
const extractRatingsForParticipant = require('./extract-ratings-for-participant')

const participantId = '12'

const participantRatingPath = `./results/ratings-${participantId}.json`
if (!fs.existsSync(participantRatingPath)) {
  extractRatingsForParticipant(participantId)
}
const participantRating = JSON.parse(fs.readFileSync(participantRatingPath))

const wrongCount = participantRating
  .filter(item => {
    const wrongForThisItem = item.rating[0].cloze.filter(
      word => !word.isCorrect && word.entered !== 'idk'
    ).length
    return wrongForThisItem > 1
  })
  .map(item => {
    return { rating: item.rating[0].cloze, id: item.item }
  })

console.log(wrongCount)
