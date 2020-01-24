const getColumn = require('./lib/get-column.js')
const columnToObject = require('./lib/column-to-object.js')
const getSyllableCount = require('./lib/get-syllable-count')
const xlsx = require('xlsx')

const filePath = '../data.xlsx'
const sheetName = 'paragraphs'

const paragraphColumn = 'B'
const sentenceCountColumn = 'G'
const naderiCountColumn = 'H'
const WPSColumn = 'I' // words per sentence
const charPWColumn = 'J' // characters per word
const syllPWColumn = 'K' // syllables per word

let paragraphs = getColumn(filePath, sheetName, paragraphColumn)
const workbook = xlsx.readFile(filePath)
const sheet = workbook.Sheets[sheetName]

const footnoteReference = /\[\d+\]/g

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
  for (const paragraph of paragraphs.slice(25)) {
    // start in row 27 (paragraph 26) - all before has already been done
    console.log(`paragraph ${i++}/${paragraphs.length}`)

    const row = paragraph.cell.slice(1)
    const words = paragraph.value.split(' ')

    const sentenceCount = sentenceCounts[row]
    const wordCount = words.length

    const charCount = words.reduce((sum, word) => sum + word.length, 0)

    let syllableCount = 0
    for (const word of words) {
      syllableCount += parseInt(await getSyllableCount(word))
    }

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
    console.log(
      `${syllableCount} syllables, ${wordCount} words => ${syllablesPerWord} syllabes per word`
    )
    xlsx.writeFile(workbook, filePath)
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

const main = async () => {
  // removeFootnoteReferences()
  // countNaderiSentences()
  await countWords()
  // removeShortParagraphs(3)

  xlsx.writeFile(workbook, filePath)
}

main()
