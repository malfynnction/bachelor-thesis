const PouchDB = require('pouchdb')
const fs = require('fs')

const newPouchDb = name => {
  const db = new PouchDB(name)
  db.sync(`http://localhost:5984/${name}`, {
    live: true,
    retry: true,
  })
  return db
}

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
  return Object.keys(voteCounts).filter(key => voteCounts[key] === maxVotes)
}

const summarizeRatings = async () => {
  const ratingDb = newPouchDb('ratings')
  const itemDb = newPouchDb('items')

  const [ratings, items] = await Promise.all([
    getAllDocs(ratingDb),
    getAllDocs(itemDb),
  ])

  const allQuestions = ['readability', 'understandability', 'complexity']

  return items.reduce((acc, item) => {
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

    // get the answers to the questions
    allQuestions.forEach(question => {
      const answers = accordingRatings
        .filter(rating => !!rating.questions[question])
        .map(rating => rating.questions[question])
      itemResult[`avg${capitalizeFirstLetter(question)}`] = getAverage(answers)
    })

    // get the hardest sentence(s) (only for paragraphs)
    if (item.sentences) {
      const hardestSentences = getHardestSentences(accordingRatings)
      itemResult.hardestSentences = hardestSentences.map(
        index => item.sentences[index]
      )
    }

    // get the results of the cloze tests
    itemResult.clozes = item.clozes.map((cloze, i) => {
      const answers = accordingRatings.map(rating => rating.cloze[i].isCorrect)
      const correctAnswers = answers.filter(answer => !!answer)
      let percentageCorrectAnswers
      if (answers.length) {
        percentageCorrectAnswers =
          (correctAnswers.length / answers.length) * 100
      }
      return { deletedWord: cloze.original, percentageCorrectAnswers }
    })
    itemResult.percentageCorrectClozes = getAverage(
      itemResult.clozes.map(cloze => cloze.percentageCorrectAnswers)
    )

    return {
      ...acc,
      [item._id]: itemResult,
    }
  }, {})
}

const summarizeDemographic = async () => {
  const participantDb = newPouchDb('participants')
  const participants = await getAllDocs(participantDb)

  const keys = ['age', 'gender', 'nativeLang', 'gerLevel']
  return participants.reduce((result, participant) => {
    keys.forEach(key => {
      if (!participant[key]) {
        return
      }
      if (!result[key]) {
        result[key] = {}
      }
      const values = participant[key].split(',')
      values.forEach(value => {
        const prevResult = result[key][value] || 0
        result[key][value] = prevResult + 1
      })
    })
    return result
  }, {})
}

const downloadFeedback = async () => {
  const feedbackDb = newPouchDb('feedback')
  const feedback = await getAllDocs(feedbackDb)
  const actualFeedback = feedback.map(item => {
    delete item._id
    delete item._rev
    return item
  })
  return actualFeedback
}

module.exports = async () => {
  const [ratings, demographic, feedback] = await Promise.all([
    summarizeRatings(),
    summarizeDemographic(),
    downloadFeedback(),
  ])
  return { ratings, demographic, feedback }
}
