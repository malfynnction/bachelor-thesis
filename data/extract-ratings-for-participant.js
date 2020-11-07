const fs = require('fs')
const { getOrDownload } = require('./lib')

module.exports = async participantId => {
  const ratings = await getOrDownload('ratings', {
    forceDownload: true,
  })
  const filtered = ratings.filter(item => item.participantId === participantId)
  const filePath = `results/ratings-${participantId}.json`

  fs.writeFileSync(filePath, JSON.stringify(filtered))

  console.log(
    `⬇️  The submitted ratings for participant ${participantId} have been downloaded and can be checked: ${filePath}`
  )
}
