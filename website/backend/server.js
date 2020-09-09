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

const shutdown = () => {
  console.log('Shutting down backend server...')
  server.close(() => {
    console.log('Backend server shut down.')
  })
  //eslint-disable-next-line  no-process-exit
  process.exit(0)
}

/*
 * PARTICIPANTS
 */

app.get('/api/participants', async (req, res) => {
  const result = await getAll(participants)
  res.send(result)
})
app.get('/api/participants/:id', async (req, res) => {
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

/*
 * ITEMS
 */

app.get('/api/items/:id', async (req, res) => {
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

app.get('/api/sessions', async (req, res) => {
  const result = await getAll(sessions)
  res.send(result)
})
app.get('/api/sessions/:id', async (req, res) => {
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

app.put('/api/ratings/_bulk', async (req, res) => {
  const { body } = req
  const options = JSON.parse(req.header('x-options'))

  const { session, seed } = options

  let tokenString = `${body[0].participantId}-${session}`
  if (seed) {
    tokenString += `-${seed}`
  }
  res.set({ 'x-token': hash.MD5(tokenString) })

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

app.get('/api/ratings', async (req, res) => {
  const result = await getAll(ratings)
  res.send(result)
})

/*
 * FEEDBACK
 */

app.post('/api/feedback', async (req, res) => {
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
 * RESULTS
 */

app.get('/api/results', async (req, res) => {
  const result = await downloadResult({
    participantDB: participants,
    itemDB: items,
    ratingDB: ratings,
    feedbackDB: feedback,
  })
  res.send(result)
})

console.log('Starting backend service...')

const port = 8080
const server = app.listen(port, () => {
  console.log(`Backend server listening on Port ${port}`)
})

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
