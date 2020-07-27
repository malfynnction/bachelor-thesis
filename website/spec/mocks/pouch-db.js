module.exports = data => {
  return {
    getAll() {
      return new Promise(resolve => resolve(data))
    },
    get(id) {
      const target = data.find(entry => entry._id === id)

      let response = target
      if (!target) {
        response = { status: 404 }
      }

      return new Promise(resolve => resolve(response))
    },
  }
}
