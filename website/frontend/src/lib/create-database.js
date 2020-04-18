const request = require('request-promise-native')

const databaseUrl = 'http://localhost:8000/api'

const createDatabase = name => {
  return {
    get: async id => {
      return new Promise((resolve, reject) => {
        request
          .get(`${databaseUrl}/${name}/${id}`, { json: true })
          .then(result => {
            if (result.error) {
              reject(result)
            } else {
              resolve(result)
            }
          })
      })
    },
    getAll: async () => {
      return request.get(`${databaseUrl}/${name}`, { json: true })
    },
    post: async data => {
      const result = await request.post({
        headers: { 'Content-Type': 'application/json' },
        url: `${databaseUrl}/${name}`,
        body: JSON.stringify(data),
      })
      return result
    },
    put: async data => {
      const result = await request.put({
        headers: { 'Content-Type': 'application/json' },
        url: `${databaseUrl}/${name}`,
        body: JSON.stringify(data),
      })
      return result
    },
    putBulk: async (data, options) => {
      return request
        .put({
          headers: {
            'x-options': JSON.stringify(options),
            'Content-Type': 'application/json',
          },
          url: `${databaseUrl}/${name}/_bulk`,
          body: JSON.stringify(data),
          resolveWithFullResponse: true,
        })
        .then(response => {
          return { token: response.headers['x-token'], body: response.body }
        })
    },
  }
}

export default createDatabase
