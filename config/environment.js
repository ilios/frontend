'use strict';

module.exports = function(environment /*, appConfig */) {
  var ENV = {
    googleFonts: [
      'Nunito:400,700',
      'Nunito Sans:400,600,700'
    ],
    EmberENV: {
      EXTEND_PROTOTYPES: {
        String: true,
        Array: true,
        Function: false,
        Date: false,
      }
    },
    featureFlags: {
      'sessionLinkingAdminUi': false,
    }
  };

  if ('development' === environment) {
    ENV.featureFlags.sessionLinkingAdminUi = true;
  }

  return ENV;

};
