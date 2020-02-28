const express = require('express')
const PouchDB = require('pouchdb')
const bodyParser = require('body-parser')
const hash = require('object-hash')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8000'

const newPouchDb = name => {
  const db = new PouchDB(name)
  db.sync(`http://couchdb:5984/${name}`, {
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

const setCorsHeader = res => {
  res.set({ 'access-control-allow-origin': frontendUrl })
  return res
}

app.get('/database/:name', (req, res) => {
  const { name } = req.params
  const database = getDatabase(name)
  database
    .allDocs({ include_docs: true })
    .then(result => {
      setCorsHeader(res).send(result.rows.map(row => row.doc))
    })
    .catch(e => setCorsHeader(res).send(e))
})

app.get('/database/:name/:id', (req, res) => {
  const { name, id } = req.params
  const database = getDatabase(name)
  database
    .get(id)
    .then(result => {
      setCorsHeader(res).send(result)
    })
    .catch(e => setCorsHeader(res).send(e))
})

app.put('/database/:name', (req, res) => {
  const { name } = req.params
  const { body } = req

  const database = getDatabase(name)
  database
    .put(body)
    .then(result => setCorsHeader(res).send(result))
    .catch(e => setCorsHeader(res).send(e))
})

app.put('/database/:name/_bulk', (req, res) => {
  const { name } = req.params
  const { body } = req
  const options = JSON.parse(req.header('X-Options'))

  const { session, seed } = options
  if (seed) {
    const token = hash.MD5(`${session}-${seed}`)
    res.set({ 'x-token': token })
  }

  const database = getDatabase(name)
  database
    .bulkDocs(body)
    .then(result => {
      setCorsHeader(res).send(result)
    })
    .catch(e => setCorsHeader(res).send(e))
})

app.listen(process.env.SERVER_PORT || 8080)
