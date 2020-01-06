const getColumn = require('./get-column.js')
const xlsx = require('xlsx')

const filePath = '../data.xlsx'
const sheetName = 'paragraphs'
const paragraphColumn = 'B'

const paragraphs = getColumn(filePath, sheetName, paragraphColumn)
const workbook = xlsx.readFile(filePath)
const sheet = workbook.Sheets[sheetName]

const removeFootnoteReferences = () => {
  const footnoteReference = /\[\d+\]/g

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
  const countColumn = 'I'
  const naderiSentences = getColumn('../Full-Dataset-Naderi19.xlsx', 'Sentences', 'C').map(({cell, value}) => value)

  const count = {}

  naderiSentences.forEach(sentence => {
    const includingParagraph = paragraphs.find(({cell, value}) => value.includes(sentence))
    if (typeof includingParagraph !== 'undefined') {
      const { cell } = includingParagraph
      count[cell] = (count[cell] || 0) + 1
    }
  })

  const cells = paragraphs.map(({cell, value}) => cell)
  cells.forEach(cell => {
    const countCell = cell.replace(paragraphColumn, countColumn)
    sheet[countCell] = {
      t: 'n', // type: number
      v: count[cell] || 0
    }
  })

  xlsx.writeFile(workbook, filePath)
}

countNaderiSentences()
