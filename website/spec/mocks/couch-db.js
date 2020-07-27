module.exports = data => {
  return {
    allDocs() {
      const db = {
        rows: data.map(row => {
          return { doc: row }
        }),
      }
      return new Promise(resolve => resolve(db))
    },
  }
}
