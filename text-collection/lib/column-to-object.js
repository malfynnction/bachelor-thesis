module.exports = array => {
  return array.reduce((obj, item) => {
    const key = item.cell.slice(1) // use only row for key, independent of column
    obj[key] = item.value
    return obj
  }, {})
}
