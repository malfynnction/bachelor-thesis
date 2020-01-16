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
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ['react', 'prettier', 'promise'],
  rules: {
    // allow import/export syntax
    'node/no-unsupported-features/es-syntax': 'off',
    // allow import/require of local, unpublished modules
    'node/no-unpublished-require': 'off',
    'node/no-unpublished-import': 'off',
  },
  parserOptions: {
    sourceType: 'module',
  },
}
