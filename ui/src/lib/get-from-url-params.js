module.exports = (key, { location }) => {
  const params = location.search.slice(1).split('&')
  const requiredParam = params.find(param => param.startsWith(key))
  return requiredParam && requiredParam.split('=')[1]
}
