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
    return sessionStorage.setItem('participantId', id)
  },
}
