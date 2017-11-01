/* eslint-env node */
'use strict';

module.exports = {
  allowedVersions: {
    'ember-getowner-polyfill': '^1.0.0 || ^2.0.0',
    'ember-inflector': '^1.0.0 || ^2.0.0',
    'ember-hash-helper-polyfill': '^0.1.2 || ^0.2.0' // workaround for dep. conflict ember-tooltips/liquid-fire
  }
};
