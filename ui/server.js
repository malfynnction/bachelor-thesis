const express = require('express')
const PouchDB = require('pouchdb')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

const newPouchDb = name => {
  const db = new PouchDB(name)
  db.sync(`http://localhost:5984/${name}`, {
    live: true,
    retry: true,
  })
  return db
}

const [participants, ratings, items, sessions] = [
  'participants',
  'ratings',
  'items',
  'sessions',
].map(name => newPouchDb(name))

const getDatabase = name => {
  switch (name) {
    case 'participants':
      return participants
    case 'ratings':
      return ratings
    case 'items':
      return items
    case 'sessions':
      return sessions
    default:
      return
  }
}

app.get('/database/:name', (req, res) => {
  const { name } = req.params
  const database = getDatabase(name)
  database
    .allDocs({ include_docs: true })
    .then(result => res.send(result.rows.map(row => row.doc)))
})

app.get('/database/:name/:id', (req, res) => {
  const { name, id } = req.params
  const database = getDatabase(name)
  database.get(id).then(result => res.send(result))
})

app.put('/database/:name', (req, res) => {
  const { name } = req.params
  const { body } = req
  const database = getDatabase(name)
  database
    .put(body)
    .then(result => res.send(result))
    .catch(e => console.error(e)) // TODO: proper error handling?
})

app.put('/database/:name/_bulk', (req, res) => {
  const { name } = req.params
  const { body } = req
  const database = getDatabase(name)
  database
    .bulkDocs(body)
    .then(result => res.send(result))
    .catch(e => console.error(e)) // TODO: proper error handling?
})

app.listen(process.env.PORT || 8080)
