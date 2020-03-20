const newPouchDb = require('./src/lib/new-pouch-db')

const ratingDb = newPouchDb('ratings')
const itemDb = newPouchDb('items')
