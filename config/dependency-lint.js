/* eslint-env node */
'use strict';

module.exports = {
  allowedVersions: {
    'ember-get-config': '^0.2.0', // workaround for dep. conflict ember-cli-mirage/ember-light-table
    'ember-getowner-polyfill': '^1.0.0 || ^2.0.0',
    'ember-inflector': '2.3.0 || ^3.0.0', // conflict between ember-data and mirage
    'ember-hash-helper-polyfill': '^0.1.2 || ^0.2.0', // workaround for dep. conflict ember-tooltips/liquid-fire
    'ember-require-module': '^0.1.2 || ^0.2.0', // workaround for dep. conflict ember-cp-validations/ember-validators
    'ember-compatibility-helpers': '^0.1.3 || ^1.0.0-beta.1', // workaround for dep. conflict ember-light-table/ember-data
    'ember-concurrency': '^0.8.17', // workaround for dep. conflict ilios-common/ember-simple-charts
  }
};
