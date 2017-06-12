module.exports = {
  globals: {
    server: true,
  },
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true
  },
  rules: {
    /* Possible Errors http://eslint.org/docs/rules/#possible-errors */
    "comma-dangle": [2, "only-multiline"],

    /* Stylistic Issues http://eslint.org/docs/rules/#stylistic-issues */
    indent: [2, 2], /* two-space indentation */
    semi: 2, /* require semi-colons */
    camelcase: 2, /* require camelcase variables */
    'no-shadow': [2, {
      builtinGlobals: true,
      allow: ['event', 'i', 'name', 'parent', 'resolve', 'self', 'select', 'scrollTo', 'status']
    },], /* Prevent shadowing globals like Object*/
  }
};
