const getFromUrlParams = require('../../frontend/src/lib/get-from-url-params')

test('extracts param from basic url', () => {
  const location = { location: { search: '?foo=bar' } }
  expect(getFromUrlParams('foo', location)).toEqual('bar')
})

test('extracts param from url with multiple params', () => {
  const location = { location: { search: '?foo=bar&baz=true' } }
  expect(getFromUrlParams('baz', location)).toEqual('true')
})

test('returns undefined for nonexistent params', () => {
  const location = { location: { search: '?foo=bar' } }
  expect(getFromUrlParams('baz', location)).toBeUndefined
})
