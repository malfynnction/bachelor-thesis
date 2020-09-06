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
    .filter(sentence => typeof sentence !== 'undefined')
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

const summarizeRatings = async (ratingDB, itemDB) => {
  const [ratings, items] = await Promise.all([
    getAllDocs(ratingDB),
    getAllDocs(itemDB),
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
      const answers = accordingRatings.map(rating => {
        if (!rating.cloze[i]) {
          console.log(`problem parsing the following rating:`)
          console.log(rating)
          return false
        }
        return rating.cloze[i].isCorrect
      })
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

const summarizeDemographic = async participantDB => {
  const participants = await getAllDocs(participantDB)

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
    try {
      result.avgListeningScore =
        (result.avgListeningScore || 0) +
        participant.listeningExercise.score / participants.length
    } catch (e) {
      console.log(e)
    }
    return result
  }, {})
}

const downloadFeedback = async feedbackDB => {
  const feedback = await getAllDocs(feedbackDB)
  return feedback.map(item => {
    delete item._id
    delete item._rev
    return item
  })
}

const downloadParticipants = async participantDB => {
  const participants = await getAllDocs(participantDB)
  return participants.map(participant => {
    delete participant._rev
    delete participant.completedTrainingSession
    return participant
  })
}

module.exports = async ({ participantDB, itemDB, ratingDB, feedbackDB }) => {
  const [ratings, demographic, feedback, participants] = await Promise.all([
    summarizeRatings(ratingDB, itemDB),
    summarizeDemographic(participantDB),
    downloadFeedback(feedbackDB),
    downloadParticipants(participantDB),
  ])
  return { ratings, demographic, feedback, participants }
}
