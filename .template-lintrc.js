'use strict';

module.exports = {
  plugins: ['@ilios/ember-template-lint-plugin'],
  extends: 'ilios:recommended',
  rules: {
    'no-implicit-this': {
      //our helpers which do not take arguments have to be listed here
      allow: ['noop'],
    },
  },
};
