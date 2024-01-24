'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'simple-unless': false,
    'no-implicit-this': {
      //our helpers which do not take arguments have to be listed here
      allow: ['browser-timezone', 'noop'],
    },
  },
};
