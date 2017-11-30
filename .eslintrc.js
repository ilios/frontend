module.exports = {
  globals: {
    server: true,
  },
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
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
    'no-shadow': [2, {
      builtinGlobals: true,
      allow: ['event', 'i', 'name', 'parent', 'resolve', 'self', 'select', 'scrollTo', 'status', '$', 'Promise']
    },], /* Prevent shadowing globals like Object*/
    'ember/new-module-imports': 2,
    'ember/no-old-shims': 2,
    'ember/closure-actions': 0,
    'ember/alias-model-in-controller': 0,
    'ember/use-ember-get-and-set': 0,
    'ember/named-functions-in-promises': 0,
    'ember/no-capital-letters-in-routes': 0,
    'ember/routes-segments-snake-case': 0,
    'ember/avoid-leaking-state-in-components': 0,
    'ember/order-in-components': 0,
    'ember/order-in-controllers': 0,
    'ember/order-in-routes': 0,
    'ember/use-brace-expansion': 0,
    'generator-star-spacing': 0,
  }
};
