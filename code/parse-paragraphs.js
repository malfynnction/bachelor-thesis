const getColumn = require('./get-column.js')
const xlsx = require('xlsx')

const filePath = '../data.xlsx'
const sheetName = 'paragraphs'
const paragraphColumn = 'B'
const naderiCountColumn = 'H'

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

countNaderiSentences()
