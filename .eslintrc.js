'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }]],
    },
  },
  plugins: ['ember'],
  extends: ['eslint:recommended', 'plugin:ember/recommended', 'plugin:prettier/recommended'],
  env: {
    browser: true,
  },
  rules: {
    'ember/classic-decorator-no-classic-methods': 0,
    'ember/no-actions-hash': 0,
    'ember/no-classic-classes': 0,
    'ember/no-classic-components': 0,
    'ember/no-component-lifecycle-hooks': 0,
    'ember/no-get': 0,
    'ember/no-mixins': 0,
    'ember/no-new-mixins': 0,
    'ember/require-tagless-components': 0,
    'no-console': 1,
  },
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.stylelintrc.js',
        './.template-lintrc.js',
        './packages/*/blueprints/*/index.js',
        './packages/*/config/**/*.js',
        './packages/*/ember-cli-build.js',
        './packages/*/index.js',
        './packages/*/testem.js',
        './packages/lti-dashboard/lib/*/index.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['plugin:n/recommended'],
    },
    {
      // test files
      files: ['packages/**/tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
      rules: {
        'qunit/require-expect': [2, 'except-simple'],
        'ember/no-classic-classes': 0,
      },
    },
  ],
};
