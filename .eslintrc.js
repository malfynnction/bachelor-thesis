module.exports = {
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:node/recommended',
    'plugin:react/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  plugins: ['react', 'prettier', 'promise'],
  rules: {
    // allow import/export syntax
    'node/no-unsupported-features/es-syntax': 'off',
    // allow import/require of local, unpublished modules
    'node/no-unpublished-require': 'off',
    'node/no-unpublished-import': 'off',
    // allow the use of apostrophes and quotation marks in html
    'react/no-unescaped-entities': 'off',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
}
