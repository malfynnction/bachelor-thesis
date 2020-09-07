const fs = require('fs')

const rawData = ''

const ratings = JSON.parse(rawData).ratings

const participantId = '33'

const filtered = Object.keys(ratings)
  .filter(item =>
    ratings[item].allRatings.some(
      allRatings => allRatings.participantId === participantId
    )
  )
  .map(item => {
    return {
      item: item,
      rating: ratings[item].allRatings.filter(
        allRatings => allRatings.participantId === participantId
      ),
    }
  })

fs.writeFileSync(`ratings-${participantId}.json`, JSON.stringify(filtered))
