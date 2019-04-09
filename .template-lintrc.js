'use strict';

module.exports = {
  plugins: ['@ilios/ember-template-lint-plugin'],
  extends: 'ilios:recommended',
  rules: {
    'no-implicit-this': false,
    'simple-unless': false,
  }
};
