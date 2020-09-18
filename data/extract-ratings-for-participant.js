const fs = require('fs')

const ratings = JSON.parse(fs.readFileSync('results/ratings.json'))

module.exports = participantId => {
  const filtered = ratings.filter(item => item.participantId === participantId)
  const filePath = `results/ratings-${participantId}.json`

  fs.writeFileSync(filePath, JSON.stringify(filtered))

  console.log(
    `⬇️  The submitted ratings for participant ${participantId} have been downloaded and can be checked: ${filePath}`
  )
}
