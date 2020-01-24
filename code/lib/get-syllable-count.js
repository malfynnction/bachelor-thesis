const request = require('request-promise-native')
const { parse } = require('node-html-parser')

module.exports = word => {
  request
    .get({
      url: `https://www.duden.de/rechtschreibung/${word}`,
    })
    .then(res => {
      const dom = parse(res)
      const rechtschreibung = dom.querySelector('#rechtschreibung')
      rechtschreibung.childNodes.forEach(tuple => {
        if (!tuple.classNames || !tuple.classNames.includes('tuple')) {
          return
        }
        tuple.childNodes.find(child => {
          console.log(child)
        })
      })
    })
    .catch(err => {
      console.error(err)
    })
}
