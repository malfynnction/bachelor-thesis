const request = require('request-promise-native')
const { parse } = require('node-html-parser')
const readline = require('readline')
const fs = require('fs')

const syllableCounts = JSON.parse(fs.readFileSync('./lib/syllable-counts.json'))
const punctuation = /\.|,|-|\(|\)|\/|"|;|:|…|„|“/g

module.exports = word => {
  const parsedWord = word
    .replace('ö', 'oe')
    .replace('ä', 'ae')
    .replace('ü', 'ue')
    .replace('ß', 'sz')
    .replace(punctuation, '')

  return new Promise((resolve, reject) => {
    request
      .get(`https://www.duden.de/rechtschreibung/${parsedWord}`)
      .then(res => {
        const dom = parse(res)
        const rechtschreibung = dom.querySelector('#rechtschreibung')
        let separation

        for (const tuple of rechtschreibung.childNodes) {
          if (!tuple.classNames || !tuple.classNames.includes('tuple')) {
            continue
          }
          const labelIndex = tuple.childNodes.findIndex((child, i) => {
            return child.childNodes.some(
              grandchild => grandchild.rawText === 'Worttrennung'
            )
          })
          if (labelIndex >= 0) {
            separation = tuple.childNodes[labelIndex + 1].childNodes[0].rawText
            break
          }
        }
        const syllables = separation.split(',')[0].split('|').length
        resolve(syllables)
      })
      .catch(err => {
        if (typeof syllableCounts[parsedWord.toLowerCase()] !== 'undefined') {
          resolve(syllableCounts[parsedWord.toLowerCase()])
        } else {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })

          rl.question(
            `I'm having problems with the word "${parsedWord}". How many syllables does it have? `,
            async syllables => {
              syllableCounts[parsedWord.toLowerCase()] = syllables
              await fs.writeFileSync(
                './lib/syllable-counts.json',
                JSON.stringify(syllableCounts)
              )
              rl.close()
              resolve(syllables)
            }
          )
        }
      })
  })
}
