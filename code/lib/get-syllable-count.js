const request = require('request-promise-native')
const { parse } = require('node-html-parser')
const fs = require('fs')

const syllableCounts = JSON.parse(fs.readFileSync('./lib/syllable-counts.json'))
const punctuation = /\.|!|,|-|\(|\)|\/|"|;|:|…|„|“/g
const vowel = /^a|[^a]a|^e|[^aeiou]e|^i|[^i]i|^o|[^o]o|^u|[^eu]u|ä|ö|ü/g

const estimateSyllables = word => (word.match(vowel) || ['']).length

module.exports = word => {
  const parsedWord = word
    .replace('ö', 'oe')
    .replace('ä', 'ae')
    .replace('ü', 'ue')
    .replace('ß', 'sz')
    .replace(punctuation, '')

  return new Promise((resolve, reject) => {
    // Ignore words that are already cached
    if (typeof syllableCounts[parsedWord.toLowerCase()] !== 'undefined') {
      resolve(syllableCounts[parsedWord.toLowerCase()])
    }

    request
      .get(`https://www.duden.de/rechtschreibung/${parsedWord}`)
      .then(async res => {
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
        syllableCounts[parsedWord.toLowerCase()] = syllables
        await fs.writeFileSync(
          './lib/syllable-counts.json',
          JSON.stringify(syllableCounts)
        )
        resolve(syllables)
      })
      .catch(async err => {
        const syllables = estimateSyllables(word)
        syllableCounts[parsedWord.toLowerCase()] = syllables
        await fs.writeFileSync(
          './lib/syllable-counts.json',
          JSON.stringify(syllableCounts)
        )
        resolve(syllables)
      })
  })
}
