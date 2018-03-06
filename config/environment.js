'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
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
    }
  };
};
