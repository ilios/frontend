/* eslint-env node */
'use strict';

module.exports = {
  allowedVersions: {
    'ember-getowner-polyfill': '^1.0.0 || ^2.0.0',
    'ember-inflector': '2.3.0 || ^3.0.0', // conflict between ember-data and mirage
    'ember-hash-helper-polyfill': '^0.1.2 || ^0.2.0', // workaround for dep. conflict ember-tooltips/liquid-fire
    'ember-require-module': '^0.1.2 || ^0.2.0', // workaround for dep. conflict ember-cp-validations/ember-validators
    'ember-concurrency': '^0.8.17', // workaround for dep. conflict ilios-common/ember-simple-charts
  }
};
