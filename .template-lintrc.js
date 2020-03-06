'use strict';

module.exports = {
  plugins: ['@ilios/ember-template-lint-plugin'],
  extends: 'ilios:recommended',
  rules: {
    'simple-unless': false,
    'no-implicit-this': {
      //our helpers which do not take arguments have to be listed here
      allow: [
        'browser-timezone'
      ]
    },
    'no-action': false,
  }
};
