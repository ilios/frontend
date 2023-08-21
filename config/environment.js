'use strict';

const API_VERSION = require('./api-version.js');

module.exports = function (environment /*, appConfig */) {
  var ENV = {
    modulePrefix: 'ilios',
    featureFlags: {
      sessionLinkingAdminUi: true,
    },
    apiVersion: API_VERSION,
  };

  if ('development' === environment) {
    ENV.featureFlags.sessionLinkingAdminUi = true;
  }

  return ENV;
};
