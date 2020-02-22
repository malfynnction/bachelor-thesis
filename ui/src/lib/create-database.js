const request = require('request-promise-native')

const databaseUrl = 'http://localhost:3000/database'

module.exports = name => {
  return {
    get: async id => {
      return request.get(`${databaseUrl}/${name}/${id}`, { json: true })
    },
    getAll: async () => {
      return request.get(`${databaseUrl}/${name}`, { json: true })
    },
    put: async data => {
      return request.put({
        headers: { 'Content-Type': 'application/json' },
        url: `${databaseUrl}/${name}`,
        body: JSON.stringify(data),
      })
    },
    putBulk: async data => {
      return request.put({
        headers: { 'Content-Type': 'application/json' },
        url: `${databaseUrl}/${name}/_bulk`,
        body: JSON.stringify(data),
      })
    },
  }
}
