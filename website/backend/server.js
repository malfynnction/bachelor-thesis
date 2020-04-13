const express = require('express')
const bodyParser = require('body-parser')
const hash = require('object-hash')
const newPouchDb = require('./lib/new-pouch-db')
const downloadResult = require('./lib/download-result')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.raw())

const [participants, ratings, items, sessions, feedback] = [
  'participants',
  'ratings',
  'items',
  'sessions',
  'feedback',
].map(name => newPouchDb(name))

const getAll = async db => {
  return db
    .allDocs({ include_docs: true })
    .then(result => {
      return result.rows.map(row => row.doc)
    })
    .catch(e => {
      console.error(e)
      return e
    })
}

/*
 * PARTICIPANTS
 */

app.get('/database/participants', async (req, res) => {
  const result = await getAll(participants)
  res.send(result)
})
app.get('/database/participants/:id', async (req, res) => {
  const { id } = req.params
  participants
    .get(id)
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.send(e)
    })
})
app.put('/database/participants', async (req, res) => {
  const { body } = req
  participants
    .put({
      _id: body._id,
      _rev: body._rev,
      gender: body.gender,
      gerLevel: body.gerLevel,
      age: body.age,
      nativeLang: body.nativeLang,
      completedTrainingSession: body.completedTrainingSession,
      completedSessions: body.completedSessions,
    })
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.send(e)
    })
})

/*
 * ITEMS
 */

app.get('/database/items/:id', async (req, res) => {
  const { id } = req.params
  items
    .get(id)
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.send(e)
    })
})

/*
 * SESSIONS
 */

app.get('/database/sessions', async (req, res) => {
  const result = await getAll(sessions)
  res.send(result)
})
app.get('/database/sessions/:id', async (req, res) => {
  const { id } = req.params
  sessions
    .get(id)
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.send(e)
    })
})

/*
 * RATINGS
 */

app.put('/database/ratings/_bulk', async (req, res) => {
  const { body } = req
  const options = JSON.parse(req.header('x-options'))

  const { session, seed } = options
  if (seed) {
    const token = hash.MD5(`${session}-${seed}`)
    res.set({ 'x-token': token })
  }

  ratings
    .bulkDocs(
      body.map(rating => {
        return {
          readingTime: rating.readingTime,
          questions: rating.questions,
          cloze: rating.cloze,
          itemId: rating.itemId,
          participantId: rating.participantId,
        }
      })
    )
    .then(result => res.send(result))
    .catch(e => {
      console.error(e)
      res.send(e)
    })
})

/*
 * FEEDBACK
 */

app.post('/database/feedback', async (req, res) => {
  const { body } = req
  feedback
    .post(body)
    .then(result => {
      res.send(result)
    })
    .catch(e => {
      console.error(e)
      res.send(e)
    })
})

/*
 * RESULT
 */

app.get('/database/result', async (req, res) => {
  const result = await downloadResult({
    participantDB: participants,
    itemDB: items,
    ratingDB: ratings,
    feedbackDB: feedback,
  })
  res.send(result)
})

app.listen(process.env.SERVER_PORT || 8080)
