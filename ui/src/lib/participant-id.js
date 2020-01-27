module.exports = {
  get: () => {
    return sessionStorage.getItem('participantId')
  },
  set: id => {
    return sessionStorage.setItem('participantId', id)
  },
  clear: () => {
    return sessionStorage.removeItem('participantId')
  },
  create: db => {
    return db.allDocs().then(docs => {
      const usedIds = docs.rows.map(participant => participant.id)
      const newId = Math.max(...usedIds, 0) + 1
      sessionStorage.setItem('participantId', newId)
      return newId
    })
  },
}
