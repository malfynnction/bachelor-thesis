const getColumn = require('./lib/get-column.js')
const columnToObject = require('./lib/column-to-object.js')
const getSyllableCount = require('./lib/get-syllable-count')
const xlsx = require('xlsx')
const fs = require('fs')
const sample = require('lodash.samplesize')

const filePath = '../data.xlsx'
const allParagraphsSheetName = 'all-paragraphs'
const selectedParagraphsSheetName = 'paragraphs'

const paragraphColumn = 'B'
const sentenceCountColumn = 'F'
const naderiCountColumn = 'G'
const WPSColumn = 'H' // words per sentence
const charPWColumn = 'I' // characters per word
const syllPWColumn = 'J' // syllables per word
const fleschKincaidColumn = 'K' // score on Flesch-Kincaid Reading Ease scale

const simpleLanguageStartingRow = 1217
const paragraphSampleSize = 60

let paragraphs = getColumn(filePath, allParagraphsSheetName, paragraphColumn)
const workbook = xlsx.readFile(filePath)
const allParagraphsSheet = workbook.Sheets[allParagraphsSheetName]
const selectedParagraphsSheet = workbook.Sheets[selectedParagraphsSheetName]

const footnoteReference = /\[\d+\]/g
const punctuation = /\.|\?|!|,|-|\(|\)|\/|"|;|:|…|„|“/g
const headerRow = /[A-z]1$/

const syllableCounts = JSON.parse(fs.readFileSync('./lib/syllable-counts.json'))

const removeFootnoteReferences = () => {
  paragraphs = paragraphs.map(({ cell, value }) => {
    return {
      cell: cell,
      value: value.replace(footnoteReference, ''),
    }
  })

  paragraphs.forEach(({ cell, value }) => {
    allParagraphsSheet[cell] = {
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
    allParagraphsSheet[countCell] = {
      t: 'n', // type: number
      v: count[cell] || 0,
    }
  })
}

const countWords = async () => {
  const sentenceCountsColumn = getColumn(
    filePath,
    allParagraphsSheetName,
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

    allParagraphsSheet[WPSColumn + row] = {
      t: 'n', // type: number
      v: wordsPerSentence,
    }

    allParagraphsSheet[charPWColumn + row] = {
      t: 'n', // type: number
      v: charPerWord,
    }

    allParagraphsSheet[syllPWColumn + row] = {
      t: 'n',
      v: syllablesPerWord,
    }
  }
}

const removeShortParagraphs = minLength => {
  const sentenceCountsColumn = getColumn(
    filePath,
    allParagraphsSheetName,
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
    allParagraphsSheet[cell] = {
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
    getColumn(filePath, allParagraphsSheetName, WPSColumn)
  )
  const syllablesPerWord = columnToObject(
    getColumn(filePath, allParagraphsSheetName, syllPWColumn)
  )

  paragraphs.forEach(({ cell, value }) => {
    const row = cell.slice(1)
    const score =
      0.39 * wordsPerSentence[row] + 11.8 * syllablesPerWord[row] - 15.59

    allParagraphsSheet[fleschKincaidColumn + row] = {
      t: 'n',
      v: score,
    }
  })
}

const copyParagraphsWithFamiliarSentences = () => {
  selectedParagraphsSheet['!ref'] = allParagraphsSheet['!ref']

  // adopt header row
  const headerCells = Object.keys(allParagraphsSheet).filter(cell =>
    headerRow.test(cell)
  )
  headerCells.forEach(
    cell => (selectedParagraphsSheet[cell] = allParagraphsSheet[cell])
  )

  let currentRow = '2'
  const allColumns = headerCells.map(cell => cell.slice(0, 1))

  const dataRows = Object.keys(allParagraphsSheet)
    .filter(cell => !headerRow.test(cell) && cell.startsWith('A'))
    .map(cell => cell.slice(1))

  dataRows.forEach(originalRow => {
    const sentenceCount =
      allParagraphsSheet[`${sentenceCountColumn}${originalRow}`].v
    const naderiCount =
      allParagraphsSheet[`${naderiCountColumn}${originalRow}`].v

    if (sentenceCount === naderiCount) {
      // all sentences in the paragraph are part of the Naderi dataset - copy paragraph to new sheet
      allColumns.forEach(
        column =>
          (selectedParagraphsSheet[`${column}${currentRow}`] =
            allParagraphsSheet[`${column}${originalRow}`])
      )
      currentRow++
    }
  })
}

const drawParagraphSample = () => {
  const samplePool = Object.keys(selectedParagraphsSheet)
    .filter(cell => {
      return cell.startsWith('A') && cell.slice(1) > 1
    })
    .map(cell => cell.slice(1))
  const selectedRows = sample(samplePool, paragraphSampleSize)

  Object.keys(selectedParagraphsSheet).forEach(cell => {
    const isMetaCell = cell.startsWith('!')
    const isHeaderCell = headerRow.test(cell)
    const isInSelectedRow = selectedRows.includes(cell.slice(1))
    if (isMetaCell || isHeaderCell || isInSelectedRow) {
      return
    }
    // delete row
    selectedParagraphsSheet[cell] = { v: '', t: 's' }
  })
}

// removeShortParagraphs(3)
// removeFootnoteReferences()
// countNaderiSentences()
// countWords()
// calculateFleschKincaidScore()

// copyParagraphsWithFamiliarSentences()
drawParagraphSample()

xlsx.writeFile(workbook, filePath)
