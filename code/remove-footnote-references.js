const getParagraphs = require('./get-paragraphs.js')
const xlsx = require('xlsx')

const filePath = '../data.xlsx'
const sheetName = 'paragraphs'

const workbook = xlsx.readFile(filePath)
const sheet = workbook.Sheets[sheetName]

const paragraphs = getParagraphs()
const footnoteReference = /\[\d+\]/g

const newParagraphs = paragraphs.map(({cell, paragraph}) => {
  return {
    cell: cell, 
    paragraph: paragraph.replace(footnoteReference, '')
  }
})

newParagraphs.forEach(({cell, paragraph}) => {
  sheet[cell] = {
    t: 's', // type: string
    v: paragraph // value
  }
})

xlsx.writeFile(workbook, filePath)
