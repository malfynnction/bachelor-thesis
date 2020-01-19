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
  create: () => {
    const id = 42 // TODO: random or get # participants
    sessionStorage.setItem('participantId', id)
    return id
  },
}
