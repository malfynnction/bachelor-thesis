module.exports = (key, options = {}) => {
  const store = options.deleteAfterSession ? sessionStorage : localStorage

  return {
    set(data) {
      store.setItem(key, JSON.stringify(data))
    },

    get() {
      try {
        return JSON.parse(store.getItem(key))
      } catch (e) {
        return
      }
    },

    clear() {
      store.removeItem(key)
    },
  }
}
