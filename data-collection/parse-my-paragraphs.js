const getColumn = require('./lib/get-column.js')
const columnToObject = require('./lib/column-to-object.js')
const getSyllableCount = require('./lib/get-syllable-count')
const xlsx = require('xlsx')
const fs = require('fs')

const filePath = '../data.xlsx'
const sheetName = 'paragraphs'

const paragraphColumn = 'B'
const sentenceCountColumn = 'F'
const naderiCountColumn = 'G'
const WPSColumn = 'H' // words per sentence
const charPWColumn = 'I' // characters per word
const syllPWColumn = 'J' // syllables per word
const fleschKincaidColumn = 'K' // score on Flesch-Kincaid Reading Ease scale

let paragraphs = getColumn(filePath, sheetName, paragraphColumn)
const workbook = xlsx.readFile(filePath)
const sheet = workbook.Sheets[sheetName]

const footnoteReference = /\[\d+\]/g
const punctuation = /\.|\?|!|,|-|\(|\)|\/|"|;|:|…|„|“/g

const syllableCounts = JSON.parse(fs.readFileSync('./lib/syllable-counts.json'))

const removeFootnoteReferences = () => {
  paragraphs = paragraphs.map(({ cell, value }) => {
    return {
      cell: cell,
      value: value.replace(footnoteReference, ''),
    }
  })

  paragraphs.forEach(({ cell, value }) => {
    sheet[cell] = {
      t: 's', // type: string
      v: value,
    }
  })
}

const countNaderiSentences = () => {
  const naderiSentences = getColumn(
    '../Full-Dataset-Naderi19.xlsx',
    'Sentences',
    'C'
  )

  const count = {}

  naderiSentences.forEach(sentence => {
    // allow some minor, irrelevant differences between Naderi's sentences and the one in the paragraphs
    const adjustedSentence = sentence.value
      .replace(footnoteReference, '')
      .replace('z.B.', 'z. B.')
    const includingParagraph = paragraphs.find(({ cell, value }) =>
      value.includes(adjustedSentence)
    )
    if (typeof includingParagraph !== 'undefined') {
      const { cell } = includingParagraph
      count[cell] = (count[cell] || 0) + 1
    }
  })

  const cells = paragraphs.map(({ cell, value }) => cell)
  cells.forEach(cell => {
    const countCell = cell.replace(paragraphColumn, naderiCountColumn)
    sheet[countCell] = {
      t: 'n', // type: number
      v: count[cell] || 0,
    }
  })
}

const countWords = async () => {
  const sentenceCountsColumn = getColumn(
    filePath,
    sheetName,
    sentenceCountColumn
  )
  const sentenceCounts = columnToObject(sentenceCountsColumn)

  let i = 0
  for (const paragraph of paragraphs) {
    console.log(`paragraph ${++i}/${paragraphs.length}`)

    const row = paragraph.cell.slice(1)
    const words = paragraph.value.split(' ')

    const sentenceCount = sentenceCounts[row]
    const wordCount = words.length
    const syllableCount = words.reduce((sum, word) => {
      const parsedWord = word
        .replace('ö', 'oe')
        .replace('ä', 'ae')
        .replace('ü', 'ue')
        .replace('ß', 'sz')
        .replace(punctuation, '')
        .toLowerCase()
      if (
        typeof syllableCounts[parsedWord] === 'undefined' ||
        syllableCounts[parsedWord] === ''
      ) {
        throw `unknown word ${word} (${parsedWord})`
      }
      return sum + parseInt(syllableCounts[parsedWord])
    }, 0)
    const charCount = words.reduce((sum, word) => sum + word.length, 0)

    const wordsPerSentence = wordCount / sentenceCount
    const charPerWord = charCount / wordCount
    const syllablesPerWord = syllableCount / wordCount

    sheet[WPSColumn + row] = {
      t: 'n', // type: number
      v: wordsPerSentence,
    }

    sheet[charPWColumn + row] = {
      t: 'n', // type: number
      v: charPerWord,
    }

    sheet[syllPWColumn + row] = {
      t: 'n',
      v: syllablesPerWord,
    }
  }
}

const removeShortParagraphs = minLength => {
  const sentenceCountsColumn = getColumn(
    filePath,
    sheetName,
    sentenceCountColumn
  )
  const sentenceCounts = columnToObject(sentenceCountsColumn)
  const toRemove = []

  paragraphs = paragraphs.filter(({ cell, value }) => {
    const row = cell.slice(1)
    const tooShort = sentenceCounts[row] < minLength
    if (tooShort) {
      toRemove.push(cell)
    }
    return !tooShort
  })

  toRemove.forEach(cell => {
    sheet[cell] = {
      t: 's',
      v: '',
    }
  })
  console.log(
    'You need to manually delete the following rows: ',
    JSON.stringify(toRemove)
  )
}

const calculateFleschKincaidScore = () => {
  const wordsPerSentence = columnToObject(
    getColumn(filePath, sheetName, WPSColumn)
  )
  const syllablesPerWord = columnToObject(
    getColumn(filePath, sheetName, syllPWColumn)
  )

  paragraphs.forEach(({ cell, value }) => {
    const row = cell.slice(1)
    const score =
      0.39 * wordsPerSentence[row] + 11.8 * syllablesPerWord[row] - 15.59

    sheet[fleschKincaidColumn + row] = {
      t: 'n',
      v: score,
    }
  })
}

// removeShortParagraphs(3)
// removeFootnoteReferences()
// countNaderiSentences()
// countWords()
calculateFleschKincaidScore()

xlsx.writeFile(workbook, filePath)
