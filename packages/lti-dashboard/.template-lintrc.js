'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', 'ember-template-lint-plugin-prettier:recommended'],
  rules: {
    'no-implicit-this': {
      //our helpers which do not take arguments have to be listed here
      allow: ['browser-timezone', 'noop'],
    },
    'no-bare-strings': true,
  },
};
