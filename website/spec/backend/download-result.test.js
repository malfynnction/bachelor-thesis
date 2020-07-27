const downloadResult = require('../../backend/lib/download-result')
const couchDB = require('../mocks/couch-db')
const cloneDeep = require('lodash.clonedeep')

const data = {
  twoParticipants: [
    {
      _id: '1',
      age: '18-26',
      nativeLang: 'German',
      gender: 'male',
      gerLevel: 'B2',
      listeningExercise: { answers: { q1: [], q2: [], q3: [] }, score: 12 },
      completedSessions: {},
      completedTrainingSession: true,
    },
    {
      _id: '2',
      age: '33-40',
      nativeLang: 'English',
      gender: 'nonbinary',
      gerLevel: 'B2',
      listeningExercise: { answers: { q1: [], q2: [], q3: [] }, score: 10 },
      completedSessions: {},
      completedTrainingSession: true,
    },
  ],
  emptyParticipant: [{ _id: '3' }],
  feedback: [
    {
      _id: '1',
      participantId: '7',
      hadTechnicalProblems: true,
      technicalProblemsDetails: 'Please describe the problems in a few words:',
      notes: 'Is there anything else you want to say?',
      didUnderstandInstructions: 6,
      unclearInstructions:
        'What was unclear? For what (if anything) would you have liked a better / different explanation?',
      unableToAnswerCorrectly: true,
      unableToAnswerCorrectlyDetails:
        'When did that happen and what did you want to answer?',
    },
    {
      _id: '2',
      participantId: '7',
      hadTechnicalProblems: false,
      notes: '',
      didUnderstandInstructions: 6,
      unclearInstructions: '',
      unableToAnswerCorrectly: false,
    },
  ],
  twoItems: [
    {
      _id: 'par_1',
      type: 'paragraph',
      text: 'paragraph text',
      sentences: ['paragraph', 'text'],
      clozes: [{ original: 'text' }],
    },
    {
      _id: 'sent_1',
      type: 'sentence',
      text: 'sentence text',
      enclosingParagraph: 'sentence text within paragraph',
      clozes: [{ original: 'text' }],
    },
  ],
  oneItem: [
    {
      _id: 'par_1',
      type: 'paragraph',
      text: 'paragraph text',
      sentences: ['paragraph', 'text'],
      clozes: [{ original: 'text' }],
    },
  ],
  twoParagraphRatings: [
    {
      itemId: 'par_1',
      readingTime: 500,
      questions: {
        readability: 1,
        hardestSentence: 1,
      },
      cloze: [{ original: 'text', isCorrect: true }],
    },
    {
      itemId: 'par_1',
      readingTime: 1000,
      questions: {
        readability: 7,
        hardestSentence: 1,
      },
      cloze: [{ original: 'text', isCorrect: false }],
    },
  ],
  twoParagraphRatingsWithDifferentHardestSentence: [
    {
      itemId: 'par_1',
      readingTime: 500,
      questions: {
        readability: 1,
        hardestSentence: 1,
      },
      cloze: [{ isCorrect: false }],
    },
    {
      itemId: 'par_1',
      readingTime: 1000,
      questions: {
        readability: 7,
        hardestSentence: 0,
      },
      cloze: [{ isCorrect: false }],
    },
  ],
}

const download = ({ participants, items, ratings, feedback }) => {
  return downloadResult({
    participantDB: couchDB(cloneDeep(participants || [])),
    itemDB: couchDB(cloneDeep(items || [])),
    ratingDB: couchDB(cloneDeep(ratings || [])),
    feedbackDB: couchDB(cloneDeep(feedback || [])),
  })
}

/*
 * participants
 */

it('returns all participant data', () => {
  expect.assertions(2)
  return download({ participants: data.twoParticipants }).then(result => {
    expect(data.twoParticipants).toMatchObject(result.participants)
    expect(result.participants[0]).not.toHaveProperty(
      'completedTrainingSession'
    )
  })
})

/*
 * demographic
 */

it('calculates the average score for the listening exercise', () => {
  expect.assertions(1)
  return download({ participants: data.twoParticipants }).then(result => {
    expect(result.demographic.avgListeningScore).toEqual(11)
  })
})

it('summarizes some entries', () => {
  expect.assertions(2)
  return download({ participants: data.twoParticipants }).then(
    ({ demographic }) => {
      expect(demographic.nativeLang).toEqual({ German: 1, English: 1 })
      expect(demographic.gerLevel).toEqual({ B2: 2 })
    }
  )
})

it('ignores missing data', () => {
  expect.assertions(2)
  return download({
    participants: [...data.twoParticipants, ...data.emptyParticipant],
  }).then(({ demographic }) => {
    expect(demographic.nativeLang).toEqual({ German: 1, English: 1 })
    expect(demographic.avgListeningScore).toBeCloseTo(22 / 3)
  })
})

/*
 * ratings
 */

it('gives some meta information', () => {
  expect.assertions(2)
  return download({
    items: data.oneItem,
    ratings: data.twoParagraphRatings,
  }).then(({ ratings }) => {
    const paragraphRating = ratings['par_1']
    expect(paragraphRating.ratingAmount).toEqual(2)
    expect(paragraphRating.allRatings).toEqual(data.twoParagraphRatings)
  })
})

it('calculates the average reading time', () => {
  expect.assertions(1)
  return download({
    items: data.oneItem,
    ratings: data.twoParagraphRatings,
  }).then(({ ratings }) => {
    expect(ratings['par_1'].avgReadingTime).toEqual(750)
  })
})

it('gets the average answers for the questions', () => {
  expect.assertions(1)
  return download({
    items: data.oneItem,
    ratings: data.twoParagraphRatings,
  }).then(({ ratings }) => {
    expect(ratings['par_1'].avgReadability).toEqual(4)
  })
})

it('gets the hardest sentence for each paragraph', () => {
  expect.assertions(1)
  return download({
    items: data.oneItem,
    ratings: data.twoParagraphRatings,
  }).then(({ ratings }) => {
    expect(ratings['par_1'].hardestSentences).toEqual(['text'])
  })
})

it("gets multiple hardest sentences if there's a tie", () => {
  expect.assertions(1)
  return download({
    items: data.oneItem,
    ratings: data.twoParagraphRatingsWithDifferentHardestSentence,
  }).then(({ ratings }) => {
    expect(ratings['par_1'].hardestSentences).toEqual(['paragraph', 'text'])
  })
})

it('calculates the percentage of correct answers for the cloze', () => {
  expect.assertions(1)
  return download({
    items: data.oneItem,
    ratings: data.twoParagraphRatings,
  }).then(({ ratings }) => {
    expect(ratings['par_1'].clozes[0]).toEqual({
      deletedWord: 'text',
      percentageCorrectAnswers: 50,
    })
  })
})

// TODO: multiple items
// TODO: cloze if nothing is answered

/*
 * feedback
 */

it('downloads all the feedback', () => {
  expect.assertions(2)
  return download({ feedback: data.feedback }).then(result => {
    expect(data.feedback).toMatchObject(result.feedback)
    expect(result.feedback[0]).not.toHaveProperty('_id')
  })
})
