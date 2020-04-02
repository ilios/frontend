'use strict';

module.exports = {
  plugins: ['@ilios/ember-template-lint-plugin'],
  extends: 'ilios:recommended',
  rules: {
    'no-implicit-this': false,
    'no-action': false,
    'no-triple-curlies': false,
  }
};
