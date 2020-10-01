const fs = require('fs')
const pearsonCorrelation = require('calculate-correlation')
const { sum, average } = require('./helpers')
const { getOrDownload } = require('./lib')

const spacesInBeginningAndEnd = /^[ \s]+|[ \s]+$/g

const items = JSON.parse(fs.readFileSync('texts/items.json'))
const naderiSentences = JSON.parse(
  fs.readFileSync('texts/naderi-sentences-for-reliability.json')
)

const understoodListeningInstructions = participant => {
  return Object.values(participant.listeningExercise.answers).some(
    answers => answers.length != 1
  )
}

const getGroupedRatings = ratings => {
  const ratingsPerItem = items.docs.reduce((acc, item) => {
    const accordingRatings = ratings.filter(
      rating => rating.itemId === item._id
    )
    return { ...acc, [item._id]: accordingRatings }
  }, {})
  delete ratingsPerItem.Training_simple
  delete ratingsPerItem.Training_average
  delete ratingsPerItem.Training_hard
  return ratingsPerItem
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

const summarizeRatings = ratings => {
  const groupedRatings = getGroupedRatings(ratings)
  const questions = ['readability', 'understandability', 'complexity']

  const result = Object.keys(groupedRatings).reduce((summary, id) => {
    const item = items.docs.find(item => item._id === id)
    const itemRatings = groupedRatings[id]
    const clozes = itemRatings.flatMap(rating =>
      rating.cloze.map(deletion => {
        if (deletion.isCorrect) {
          return 'correct'
        } else if (deletion.entered === 'idk') {
          return 'idk'
        } else {
          return 'wrong'
        }
      })
    )

    const itemResult = {
      text: item.text,
      ratingAmount: itemRatings.length,
      readingTime: average(itemRatings.map(rating => rating.readingTime)),
      percentageCorrectClozes:
        (clozes.filter(answer => answer === 'correct').length / clozes.length) *
        100,
      percentageIncorrectClozes:
        (clozes.filter(answer => answer === 'wrong').length / clozes.length) *
        100,
      hardestSentences: getHardestSentences(itemRatings).map(
        index => item.sentences[index]
      ),
    }
    questions.forEach(question => {
      itemResult[question] = average(
        itemRatings.map(rating => rating.questions[question])
      )
    })

    summary[id] = itemResult
    return summary
  }, {})

  fs.writeFileSync('results/summary/ratings.json', JSON.stringify(result))
}

const summarizeMeta = (participants, ratings, scammedRatings) => {
  if (!fs.existsSync('results/summary/ratings.json')) {
    summarizeRatings()
  }
  const summarizedRatings = JSON.parse(
    fs.readFileSync('results/summary/ratings.json')
  )

  const summary = {}

  summary.totalParticipants = participants.length
  summary.totalRatings = sum(
    Object.values(summarizedRatings).map(rating => rating.ratingAmount)
  )
  summary.totalRatingsSentences = sum(
    Object.keys(summarizedRatings)
      .filter(id => id.startsWith('sent_'))
      .map(id => summarizedRatings[id].ratingAmount)
  )
  summary.totalRatingsParagraphs = sum(
    Object.keys(summarizedRatings)
      .filter(id => !id.startsWith('sent_'))
      .map(id => summarizedRatings[id].ratingAmount)
  )

  summary.avgRatingPerItem =
    summary.totalRatings / Object.keys(summarizedRatings).length
  summary.minRatingPerItem = Math.min(
    ...Object.values(summarizedRatings).map(rating => rating.ratingAmount)
  )
  summary.avgSurveysPerParticipant = average(
    participants.map(p => Object.keys(p.completedSessions).length)
  )
  summary.itemsWithTooFewRatings = Object.values(summarizedRatings)
    .map(r => r.ratingAmount)
    .filter(a => a < 12).length

  summary.legitParticipants = {
    percentageCorrectClozes: average(
      Object.values(summarizedRatings).map(
        rating => rating.percentageCorrectClozes
      )
    ),
    avgReadingTime: average(
      ratings.filter(r => r.readingTime > 0).map(r => r.readingTime)
    ),
  }

  summary.scammers = {
    percentageCorrectClozes:
      average(
        scammedRatings.flatMap(r => r.cloze.map(c => Number(c.isCorrect)))
      ) * 100,
    avgReadingTime: average(
      scammedRatings.filter(r => r.readingTime > 0).map(r => r.readingTime)
    ),
  }

  summary.reliabilityComplexity = pearsonCorrelation(
    Object.keys(naderiSentences).map(id => naderiSentences[id].complexity),
    Object.keys(naderiSentences).map(id => summarizedRatings[id].complexity)
  )
  summary.reliabilityUnderstandability = pearsonCorrelation(
    Object.keys(naderiSentences).map(
      id => naderiSentences[id].understandability
    ),
    Object.keys(naderiSentences).map(
      id => summarizedRatings[id].understandability
    )
  )
  fs.writeFileSync('results/summary/meta.json', JSON.stringify(summary))
}

const summarizeFeedback = async () => {
  const feedback = await getOrDownload('feedback')
  const summary = {
    totalAmount: feedback.length,
    participantAmount: new Set(feedback.map(f => f.participantId)).size,
    hadTechnicalProblems: feedback.filter(f => !!f.hadTechnicalProblems).length,
    technicalProblems: feedback
      .filter(f => !!f.hadTechnicalProblems)
      .map(f => f.technicalProblemsDetails),
    unableToAnswerCorrectly: feedback.filter(f => !!f.unableToAnswerCorrectly)
      .length,
    impossibleAnswers: feedback
      .filter(f => !!f.unableToAnswerCorrectly)
      .map(f => f.unableToAnswerCorrectlyDetails),
    avgUnderstandingOfInstructions: average(
      feedback.map(f => f.didUnderstandInstructions)
    ),
    unclearInstructions: feedback
      .filter(f => !!f.unclearInstructions)
      .map(f => f.unclearInstructions),
    notes: feedback.filter(f => !!f.notes).map(f => f.notes),
  }

  fs.writeFileSync('results/summary/feedback.json', JSON.stringify(summary))
}

const summarizeDemographic = participants => {
  const keys = ['age', 'gender', 'nativeLang', 'gerLevel']
  const summary = participants.reduce((result, participant) => {
    keys.forEach(key => {
      if (!participant[key]) {
        return
      }
      if (!result[key]) {
        result[key] = {}
      }
      const values = participant[key]
        .split(',')
        .map(e => e.replace(spacesInBeginningAndEnd, ''))
      values.forEach(value => {
        const prevResult = result[key][value] || 0
        result[key][value] = prevResult + 1
      })
    })
    return result
  }, {})

  summary.totalParticipants = participants.length

  const participantsWhoUnderstoodListeningInstructions = participants.filter(
    p => understoodListeningInstructions(p)
  )
  summary.listeningExercise = {
    probablyDidntUnderstandInstructions:
      participants.length -
      participantsWhoUnderstoodListeningInstructions.length,
    overallAverage:
      participants.reduce((sum, p) => sum + p.listeningExercise.score, 0) /
      participants.length,
    averageIfUnderstoodInstructions:
      participantsWhoUnderstoodListeningInstructions.reduce(
        (sum, p) => sum + p.listeningExercise.score,
        0
      ) / participantsWhoUnderstoodListeningInstructions.length,
  }

  fs.writeFileSync('results/summary/demographics.json', JSON.stringify(summary))
}

module.exports = {
  getGroupedRatings,
  demographic: participants => summarizeDemographic(participants),
  ratings: ratings => summarizeRatings(ratings),
  meta: (participants, ratings, scammedRatings) =>
    summarizeMeta(participants, ratings, scammedRatings),
  feedback: () => summarizeFeedback(),
}
