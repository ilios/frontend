'use strict';

const API_VERSION = require('./api-version.js');

module.exports = function(environment /*, appConfig */) {
  var ENV = {
    googleFonts: [
      'Nunito:400,700',
      'Nunito Sans:400,600,700'
    ],
    moment: {
      includeLocales: ['es', 'fr'],
      // Options:
      // 'all' - all years, all timezones
      // '2010-2020' - 2010-2020, all timezones
      // 'none' - no data, just timezone API
      includeTimezone: 'all'
    },
    EmberENV: {
      EXTEND_PROTOTYPES: {
        String: true,
        Array: true,
        Function: false,
        Date: false,
      }
    },
    featureFlags: {
      'sessionLinkingAdminUi': true,
    },
    apiVersion: API_VERSION,
  };

  if ('development' === environment) {
    ENV.featureFlags.sessionLinkingAdminUi = true;
  }

  return ENV;

};
