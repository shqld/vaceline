module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
  },
  globals: {
    console: true,
    process: true,
    module: true,
    require: true,
  },
  rules: {
    'no-unused-vars': 'off',
    'no-dupe-class-members': 'off',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
  },
}
