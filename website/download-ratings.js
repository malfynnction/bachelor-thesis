const PouchDB = require('pouchdb')

const newPouchDb = name => {
  const db = new PouchDB(name)
  db.sync(`http://localhost:5984/${name}`, {
    live: true,
    retry: true,
  })
  return db
}

const ratingDb = newPouchDb('ratings')
const itemDb = newPouchDb('items')

const getAllDocs = async db => {
  return db
    .allDocs({ include_docs: true })
    .then(result => result.rows.map(row => row.doc))
    .catch(e => {
      console.error(e)
      return e
    })
}

const getAverage = array => {
  if (array.length === 0) {
    return
  }
  const sum = array.reduce((acc, curr) => acc + curr, 0)
  return sum / array.length
}

const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const getHardestSentences = ratings => {
  const hardestSentences = ratings.map(
    rating => rating.questions.hardestSentence
  )
  const voteCounts = hardestSentences
    .filter(sentence => !!sentence)
    .reduce((acc, sentence) => {
      if (acc[sentence]) {
        acc[sentence] += 1
      } else {
        acc[sentence] = 1
      }
      return acc
    }, {})
  const maxVotes = Math.max(...Object.values(voteCounts))
  return Object.keys(voteCounts.filter(key => voteCounts[key] === maxVotes))
}

const download = async () => {
  const [ratings, items] = await Promise.all([
    getAllDocs(ratingDb),
    getAllDocs(itemDb),
  ])

  const allQuestions = ['readability', 'understandability', 'complexity']

  const result = items.reduce((acc, item) => {
    const accordingRatings = ratings.filter(
      rating => rating.itemId === item._id
    )

    const itemResult = {
      text: item.text,
      allRatings: accordingRatings,
      ratingAmount: accordingRatings.length,
      avgReadingTime:
        getAverage(accordingRatings.map(rating => rating.readingTime)) || 0,
    }

    allQuestions.forEach(question => {
      const answers = accordingRatings
        .filter(rating => !!rating.questions[question])
        .map(rating => rating.questions[question])
      itemResult[`avg${capitalizeFirstLetter(question)}`] = getAverage(answers)
    })

    if (item.sentences) {
      const hardestSentences = getHardestSentences(accordingRatings)
      console.log(hardestSentences)
    }

    return {
      ...acc,
      [item._id]: itemResult,
    }
  }, {})
}

download()
