module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 8,
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
    semi: 2 /* require semi-colons */
  }
};
