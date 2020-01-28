const shuffle = require('lodash.shuffle')
const newPouchDB = require('./new-pouch-db')

const pouchSessions = newPouchDB('items')

module.exports = async () => {
  const allItems = await pouchSessions.allDocs({ include_docs: true })
  const items = allItems.rows.map(row => row.doc)
  const session = { items: shuffle(items), index: 0 }
  return session
}
