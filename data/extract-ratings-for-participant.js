const fs = require('fs')

const rawData = fs.readFileSync('results/ratings.json')
const ratings = JSON.parse(rawData)

module.exports = participantId => {
  const filtered = ratings.filter(item => item.participantId === participantId)

  fs.writeFileSync(
    `results/ratings-${participantId}.json`,
    JSON.stringify(filtered)
  )
}
