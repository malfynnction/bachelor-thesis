const xlsx = require('xlsx')

module.exports = (filePath, sheetName, paragraphColumn) => {
  const workbook = xlsx.readFile(filePath)
  const cells = workbook.Sheets[sheetName]

  // get the values of all cells in the specified column
  const paragraphs = Object.keys(cells)
    .filter(cell => cell.startsWith(paragraphColumn))
    .map(cell => {
      return {
        cell: cell,
        value: cells[cell].v,
      }
    })

  // remove header cell
  return paragraphs.slice(1)
}
