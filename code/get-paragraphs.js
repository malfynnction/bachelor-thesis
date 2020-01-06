const xlsx = require('xlsx')

const filePath = '../texts/my-data.xlsx'
const sheetName = 'paragraphs'
const paragraphColumn = 'B'

module.exports = () => {
  const workbook = xlsx.readFile(filePath)
  const cells = workbook.Sheets[sheetName]

  // get the values of all cells in the specified "paragraph" column
  const paragraphs = Object.keys(cells).filter(cell => cell.startsWith(paragraphColumn)).map(cell => cells[cell].v)

  // remove header cell
  return paragraphs.slice(1)
}