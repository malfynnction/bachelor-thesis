const PouchDB = require('pouchdb').default

module.exports = name => {
  const db = new PouchDB(name)
  db.sync(`http://localhost:5984/${name}`, {
    live: true,
    retry: true,
  })
  return db
}
