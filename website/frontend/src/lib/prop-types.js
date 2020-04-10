import PropTypes from 'prop-types'

export const databasePropType = PropTypes.shape({
  get: PropTypes.func,
  getAll: PropTypes.func,
  put: PropTypes.func,
  putBulk: PropTypes.func,
})

export const itemPropType = PropTypes.shape({
  type: PropTypes.string,
  text: PropTypes.string,
  enclosingParagraph: PropTypes.string,
  sentences: PropTypes.arrayOf(PropTypes.string),
  clozes: PropTypes.arrayOf(
    PropTypes.shape({
      wordIndex: PropTypes.number,
      original: PropTypes.string,
      alternativeSuggestions: PropTypes.arrayOf(PropTypes.string),
    })
  ),
})
