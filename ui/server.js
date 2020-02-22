const express = require('express')
const app = express()

app.get('/ping', function(req, res) {
  console.log('pong')
})

app.listen(process.env.PORT || 8080)
