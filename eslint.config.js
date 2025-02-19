const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierConfig = require('eslint-config-prettier');
const pluginCypress = require('eslint-plugin-cypress/flat');
const jest = require('eslint-plugin-jest');
const tseslint = require('typescript-eslint');

module.exports = [
  {
    ignores: ['**/node_modules/*', '**/dist/*', '**/docs/*', 'eslint.config.js']
  },

  js.configs.recommended,
  pluginCypress.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...tsPlugin.configs['eslint-recommended'].rules,
      ...tsPlugin.configs.recommended.rules,
      ...prettierConfig.rules
    }
  },

  // Overrides test
  {
    files: ['test/**/*.ts'],
    ...jest.configs['flat/recommended'],
    plugins: {
      cypress: pluginCypress
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-constant-condition': 'off',
      'cypress/no-unnecessary-waiting': 'off'
    }
  },

  // Overrides packages
  {
    files: ['packages/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-constant-condition': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  },

  // Overrides scripts
  {
    files: ['scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-constant-condition': 'off'
    }
  }
];
