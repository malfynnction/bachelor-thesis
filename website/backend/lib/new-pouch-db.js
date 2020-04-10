const PouchDB = require('pouchdb')

module.exports = name => {
  const db = new PouchDB(name)
  db.sync(`http://couchdb:5984/${name}`, {
    live: true,
    retry: true,
  })
  return db
}
