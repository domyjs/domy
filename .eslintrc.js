module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  ignorePatterns: ['node_modules/'],
  overrides: [
    {
      files: ['packages/**/*.ts', 'scripts/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-constant-condition': 'off'
      }
    }
  ]
};
