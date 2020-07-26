module.exports = data => {
  return {
    allDocs(options) {
      const db = {}
      if (options.include_docs) {
        db.rows = data.map(row => {
          return { doc: row }
        })
      }
      return new Promise(resolve => resolve(db))
    },
  }
}
