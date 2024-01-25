'use strict';

const API_VERSION = require('./api-version.js');

module.exports = function (environment /*, appConfig */) {
  var ENV = {
    featureFlags: {},
    apiVersion: API_VERSION,
  };

  if ('development' === environment) {
    //development customizations
  }

  return ENV;
};
