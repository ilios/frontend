module.exports = {
  root: true,
  extends: [
    '@ilios/eslint-config-ember'
  ],
  rules: {
    'ember/use-ember-get-and-set': 0,
    'ember/no-jquery': 0,
    'ember/use-brace-expansion': 0,
    'ember/no-new-mixins': 0,
    'ember/no-capital-letters-in-routes': 0,
    'ember/no-unnecessary-route-path-option': 0,
    'ember/routes-segments-snake-case': 0,
    'sort-imports': 0,
    "node/no-extraneous-require": ["error", {
      "allowModules": [
        "broccoli-file-creator",
        "broccoli-merge-trees",
        "browserslist",
        "caniuse-db",
        "dotenv",
        "postcss-scss"
      ]
    }]
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2018
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here

        // this can be removed once the following is fixed
        // https://github.com/mysticatea/eslint-plugin-node/issues/77
        'node/no-unpublished-require': 'off'
      })
    }
  ]
};
