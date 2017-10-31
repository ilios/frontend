/* eslint-env node */
'use strict';

module.exports = {
  allowedVersions: {
    'ember-getowner-polyfill': '^1.0.0 || ^2.0.0',
    'ember-inflector': '^1.0.0 || ^2.0.0',
    'ember-weakmap': '^2.0.0 || ^3.1.1', // workaround for dependency conflict between ember-moment and liquid-tether
    'ember-hash-helper-polyfill': '^0.1.2 || ^0.2.0' // workaround for dep. conflict ember-tooltips/liquid-fire
  }
};
