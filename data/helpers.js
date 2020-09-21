const sum = array => array.reduce((sum, curr) => sum + curr, 0)
const average = array => sum(array) / array.length
const stdDev = array => {
  const mean = average(array)
  return Math.sqrt(sum(array.map(e => (e - mean) ** 2)) / array.length)
}

module.exports = { sum, average, stdDev }
