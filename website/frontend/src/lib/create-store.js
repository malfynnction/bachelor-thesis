module.exports = key => {
  const store = localStorage

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
