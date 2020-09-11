const fs = require('fs')

const spacesInBeginningAndEnd = /^[ \s]+|[ \s]+$/g

const participants = JSON.parse(
  fs.readFileSync('results/usable-participants.json')
)

const understoodListeningInstructions = participant => {
  return Object.values(participant.listeningExercise.answers).some(
    answers => answers.length != 1
  )
}

const summarizeDemographic = () => {
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

summarizeDemographic()
