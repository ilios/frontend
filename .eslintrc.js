module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    /* Possible Errors http://eslint.org/docs/rules/#possible-errors */
    "comma-dangle": [2, "only-multiline"],
    "radix": [2, "always"],
    /* Stylistic Issues http://eslint.org/docs/rules/#stylistic-issues */
    indent: [2, 2], /* two-space indentation */
    semi: 2, /* require semi-colons */
    camelcase: 2, /* require camelCase variables */
    'ember/new-module-imports': 2,
    'ember/no-old-shims': 2,
    'ember/closure-actions': 0,
    'ember/alias-model-in-controller': 0,
    'ember/use-ember-get-and-set': 0,
    'ember/named-functions-in-promises': 0,
    'ember/no-capital-letters-in-routes': 0,
    'ember/routes-segments-snake-case': 0,
    'ember/avoid-leaking-state-in-components': 0,
    'ember/order-in-components': 2,
    'ember/order-in-controllers': 2,
    'ember/order-in-routes': 2,
    'ember/use-brace-expansion': 0,
    'generator-star-spacing': 0,
  },
  overrides: [
    // node files
    {
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      }
    },
    // test files
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      rules: {
        "no-restricted-globals": [
          "error",
          {
            name: "find",
            message: "You forgot to import `find`, and we are preventing accidental usage of `window.find`."
          },
        ]
      }
    }
  ]
};
