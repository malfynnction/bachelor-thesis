const xlsx = require('xlsx')
const fs = require('fs')
const summarize = require('./summarize')
const { extractUsableResults } = require('./lib')
const { average, stdDev } = require('./helpers')

const filePath = '../data.xlsx'
const ratingsSheetName = 'results'
const naderiPath = '../Full-Dataset-Naderi19.xlsx'
const naderiSheetName = 'Final_Ratings_Table'

const idColumn = 'A'
const voteCountColumn = 'B'
const readabilityColumn = 'C'
const readabilityStdColumn = 'D'
const complexityColumn = 'E'
const complexityStdColumn = 'F'
const readingTimeColumn = 'G'
const readingTimePerWordColumn = 'H'
const understandabilityColumn = 'I'
const understandabilityStdColumn = 'J'
const clozeResultColumn = 'K'
const sentenceComplexityColumn = 'L'
const sentenceUnderstandabilityColumn = 'M'
const sentenceLexicalDifficultyColumn = 'N'

const items = JSON.parse(fs.readFileSync('texts/items.json'))

const footnote = /\[\d+\]/g

const getNaderiSentences = () => {
  const naderiSheet = xlsx.readFile(naderiPath).Sheets[naderiSheetName]
  const naderiIdColumn = 'A'
  const naderiSentenceColumn = 'B'
  const naderiComplexityColumn = 'F'
  const naderiUnderstandabilityColumn = 'I'
  const naderiLexicalDifficultyColumn = 'L'

  return Object.keys(naderiSheet)
    .filter(cell => cell.startsWith(naderiSentenceColumn))
    .reduce((collection, cell) => {
      const row = cell.slice(1)

      const id = naderiSheet[`${naderiIdColumn}${row}`].v
      // adjust minor inconsistencies
      const sentence = naderiSheet[`${naderiSentenceColumn}${row}`].v
        .replace(footnote, '')
        .replace('v Chr', 'v. Chr.')
        .replace('P Ticinius', 'P. Ticinius')
        .replace(' 2 ', ' 2. ')
        .replace(' zB ', ' z. B. ')
      const complexity = naderiSheet[`${naderiComplexityColumn}${row}`].v
      const understandability =
        naderiSheet[`${naderiUnderstandabilityColumn}${row}`].v
      const lexicalDifficulty =
        naderiSheet[`${naderiLexicalDifficultyColumn}${row}`].v
      const obj = {
        id,
        sentence,
        complexity,
        understandability,
        lexicalDifficulty,
      }
      return [...collection, obj]
    }, [])
}

module.exports = async () => {
  const { ratings } = await extractUsableResults()
  const groupedRatings = summarize.getGroupedRatings(ratings)
  const naderiSentences = getNaderiSentences()
  const paragraphSentenceMapping = {}

  const workbook = xlsx.readFile(filePath)
  const sheet = workbook.Sheets[ratingsSheetName]

  const itemIds = Object.keys(groupedRatings)

  itemIds
    .filter(id => !id.startsWith('sent_')) // sentences were only control items, ignore them
    .forEach((itemId, index) => {
      const itemRatings = groupedRatings[itemId]
      const item = items.docs.find(i => i._id === itemId)
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
      const readingTime = average(itemRatings.map(r => r.readingTime))
      const readingTimePerCorrectCloze = average(
        itemRatings
          .filter(rating => rating.cloze.length > 0)
          .map(r => {
            const clozeCorrectness =
              r.cloze.filter(
                answer => answer.isCorrect || answer.entered === 'idk'
              ).length / r.cloze.length
            if (clozeCorrectness === 0) {
              return r.readingTime * (r.cloze.length + 1)
            }
            return r.readingTime / clozeCorrectness
          })
      )
      sheet[`${readingTimeColumn}${row}`] = {
        t: 'n',
        v: readingTime,
      }
      sheet[`${readingTimePerWordColumn}${row}`] = {
        t: 'n',
        v: readingTimePerCorrectCloze,
      }

      // cloze correctness
      const clozeCorrectness = average(
        itemRatings
          .filter(rating => rating.cloze.length > 0)
          .map(rating => {
            return (
              rating.cloze.filter(answer => answer.isCorrect).length /
              rating.cloze.length
            )
          })
      )
      sheet[`${clozeResultColumn}${row}`] = {
        t: 'n',
        v: clozeCorrectness,
      }

      // sentence averages
      const naderiResult = item.sentences.flatMap(sentence =>
        naderiSentences.filter(naderiSentence =>
          naderiSentence.sentence.includes(sentence)
        )
      )

      sheet[`${sentenceComplexityColumn}${row}`] = {
        t: 'n',
        v: average(naderiResult.map(s => s.complexity)),
      }
      sheet[`${sentenceUnderstandabilityColumn}${row}`] = {
        t: 'n',
        v: average(naderiResult.map(s => s.understandability)),
      }
      sheet[`${sentenceLexicalDifficultyColumn}${row}`] = {
        t: 'n',
        v: average(naderiResult.map(s => s.lexicalDifficulty)),
      }

      // paragraph <-> sentence mapping
      paragraphSentenceMapping[itemId] = {
        complexity: average(complexityScores),
        understandability: average(understandabilityScores),
        sentenceIds: naderiResult.map(sentence => sentence.id),
        sentenceComplexity: naderiResult.map(sentence => sentence.complexity),
        sentenceUnderstandability: naderiResult.map(
          sentence => sentence.understandability
        ),
      }
    })

  fs.writeFileSync(
    'results/paragraph-sentence-mapping.json',
    JSON.stringify(paragraphSentenceMapping)
  )
  xlsx.writeFile(workbook, filePath)
}
