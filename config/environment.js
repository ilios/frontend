/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
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
