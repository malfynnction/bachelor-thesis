const sum = array => array.reduce((sum, curr) => sum + curr, 0)
const average = array => sum(array) / array.length
const stdDev = array => {
  const mean = average(array)
  return Math.sqrt(sum(array.map(e => (e - mean) ** 2)) / array.length)
}
const rms = array => Math.sqrt(average(array.map(value => value ** 2)))
const median = array => {
  array.sort((a, b) => a - b)
  const middle = Math.floor(array.length / 2)
  if (array.length % 2 === 0) {
    return average([array[middle - 1], array[middle]])
  } else {
    return array[middle]
  }
}

module.exports = { sum, average, stdDev, rms, median }
