const getColumn = require('./lib/get-column.js')
const columnToObject = require('./lib/column-to-object.js')
const xlsx = require('xlsx')

const filePath = '../data.xlsx'
const sheetName = 'paragraphs'

const paragraphColumn = 'B'
const sentenceCountColumn = 'G'
const naderiCountColumn = 'H'
const WPSColumn = 'I' // words per sentence
const charPWColumn = 'J' // characters per word

const paragraphs = getColumn(filePath, sheetName, paragraphColumn)
const workbook = xlsx.readFile(filePath)
const sheet = workbook.Sheets[sheetName]

const footnoteReference = /\[\d+\]/g

const removeFootnoteReferences = () => {
  const newParagraphs = paragraphs.map(({cell, value}) => {
    return {
      cell: cell, 
      value: value.replace(footnoteReference, '')
    }
  })

  newParagraphs.forEach(({cell, value}) => {
    sheet[cell] = {
      t: 's', // type: string
      v: value
    }
  })

  xlsx.writeFile(workbook, filePath)
}

const countNaderiSentences = () => {
  const naderiSentences = getColumn('../Full-Dataset-Naderi19.xlsx', 'Sentences', 'C')

  const count = {}

  naderiSentences.forEach(sentence => {
    // allow some minor, irrelevant differences between Naderi's sentences and the one in the paragraphs
    const adjustedSentence = sentence.value.replace(footnoteReference, '').replace('z.B.', 'z. B.')
    const includingParagraph = paragraphs.find(({cell, value}) => value.includes(adjustedSentence))
    if (typeof includingParagraph !== 'undefined') {
      const { cell } = includingParagraph
      count[cell] = (count[cell] || 0) + 1
    }
  })

  const cells = paragraphs.map(({cell, value}) => cell)
  cells.forEach(cell => {
    const countCell = cell.replace(paragraphColumn, naderiCountColumn)
    sheet[countCell] = {
      t: 'n', // type: number
      v: count[cell] || 0
    }
  })

  xlsx.writeFile(workbook, filePath)
}

const countWords = () => {
  const sentenceCountsColumn = getColumn(filePath, sheetName, sentenceCountColumn)
  const sentenceCounts = columnToObject(sentenceCountsColumn)

  paragraphs.forEach(paragraph => {
    const row = paragraph.cell.slice(1)
    const words = paragraph.value.split(' ')

    const sentenceCount = sentenceCounts[row]
    const wordCount = words.length
    const charCount = words.reduce((sum, word) => sum + word.length, 0)

    const wordsPerSentence = wordCount / sentenceCount
    const charPerWord = charCount / wordCount

    sheet[WPSColumn + row] = {
      t: 'n', // type: number
      v: wordsPerSentence
    }

    sheet[charPWColumn + row] = {
      t: 'n', // type: number
      v: charPerWord
    }
  })

  xlsx.writeFile(workbook, filePath)
}

countWords()