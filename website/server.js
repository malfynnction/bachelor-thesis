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

const setCorsHeader = res => {
  res.set({ 'access-control-allow-origin': frontendUrl })
  return res
}

const getAll = async db => {
  return db
    .allDocs({ include_docs: true })
    .then(result => {
      return result.rows.map(row => row.doc)
    })
    .catch(e => {
      return e
    })
}

const get = async (db, id) => {
  return db.get(id).catch(e => {
    return e
  })
}

const put = async (db, data) => {
  return db.put(data).catch(e => {
    return e
  })
}

const putBulk = async (db, data) => {
  return db.bulkDocs(data).catch(e => {
    return e
  })
}

app.get('/database/participants', async (req, res) => {
  const result = await getAll(participants)
  setCorsHeader(res).send(result)
})
app.get('/database/participants/:id', async (req, res) => {
  const { id } = req.params
  const result = await get(participants, id)
  setCorsHeader(res).send(result)
})
app.put('/database/participants', async (req, res) => {
  const { body } = req
  const result = await put(participants, body)
  setCorsHeader(res).send(result)
})

app.get('/database/items/:id', async (req, res) => {
  const { id } = req.params
  const result = await get(items, id)
  setCorsHeader(res).send(result)
})

app.get('/database/sessions', async (req, res) => {
  const result = await getAll(sessions)
  setCorsHeader(res).send(result)
})
app.get('/database/sessions/:id', async (req, res) => {
  const { id } = req.params
  const result = await get(sessions, id)
  setCorsHeader(res).send(result)
})

app.put('/database/ratings/_bulk', async (req, res) => {
  const { body } = req
  const options = JSON.parse(req.header('x-options'))

  const { session, seed } = options
  if (seed) {
    const token = hash.MD5(`${session}-${seed}`)
    res.set({ 'x-token': token })
  }

  const result = await putBulk(ratings, body)
  setCorsHeader(res).send(result)
})

app.listen(process.env.SERVER_PORT || 8080)
