const xlsx = require('xlsx')
const fs = require('fs')
const summarize = require('./summarize')
const { extractUsableResults } = require('./lib')
const { average, stdDev } = require('./helpers')

const filePath = '../data.xlsx'
const ratingsSheetName = 'results'

const idColumn = 'A'
const voteCountColumn = 'B'
const readabilityColumn = 'C'
const readabilityStdColumn = 'D'
const complexityColumn = 'E'
const complexityStdColumn = 'F'
const readingTimeColumn = 'G'
const understandabilityColumn = 'H'
const understandabilityStdColumn = 'I'
const clozeResultColumn = 'J'

module.exports = async () => {
  const { ratings } = await extractUsableResults()
  const groupedRatings = summarize.getGroupedRatings(ratings)

  const workbook = xlsx.readFile(filePath)
  const sheet = workbook.Sheets[ratingsSheetName]

  const itemIds = Object.keys(groupedRatings)

  sheet['!ref'] = `A1:M${itemIds.length}`

  itemIds.forEach((itemId, index) => {
    if (itemId.startsWith('sent_')) {
      // sentences were only control items, skip them
      return
    }
    const itemRatings = groupedRatings[itemId]
    const row = index + 3 // leave space for header rows

    sheet[`${idColumn}${row}`] = { t: 'n', v: itemId }
    sheet[`${voteCountColumn}${row}`] = {
      t: 'n',
      v: itemRatings.length,
    }

    // readability question
    const readabilityScores = itemRatings.map(r => r.questions.readability)
    sheet[`${readabilityColumn}${row}`] = {
      t: 'n',
      v: average(readabilityScores),
    }
    sheet[`${readabilityStdColumn}${row}`] = {
      t: 'n',
      v: stdDev(readabilityScores),
    }

    // complexity question
    const complexityScores = itemRatings.map(r => r.questions.complexity)
    sheet[`${complexityColumn}${row}`] = {
      t: 'n',
      v: average(complexityScores),
    }
    sheet[`${complexityStdColumn}${row}`] = {
      t: 'n',
      v: stdDev(complexityScores),
    }

    // understandability question
    const understandabilityScores = itemRatings.map(
      r => r.questions.understandability
    )
    sheet[`${understandabilityColumn}${row}`] = {
      t: 'n',
      v: average(understandabilityScores),
    }
    sheet[`${understandabilityStdColumn}${row}`] = {
      t: 'n',
      v: stdDev(understandabilityScores),
    }

    // reading time
    sheet[`${readingTimeColumn}${row}`] = {
      t: 'n',
      v: (average(itemRatings.map(r => r.readingTime)) / 1000).toFixed(2),
    }

    // cloze correctness
    const clozeCorrectness = average(
      itemRatings.map(rating => {
        return (
          rating.cloze.filter(answer => answer.isCorrect).length /
          rating.cloze.length
        )
      })
    )
    sheet[`${clozeResultColumn}${row}`] = {
      t: 's',
      v: `${(clozeCorrectness * 100).toFixed(2)}%`,
    }
  })

  xlsx.writeFile(workbook, filePath)
}
