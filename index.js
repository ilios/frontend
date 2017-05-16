/* eslint-env node */
'use strict';

module.exports = {
  name: 'ilios-common',
  config: function() {
    let ENV = {
      serverVariables: {
        tagPrefix: 'iliosconfig',
        vars: ['api-host', 'api-name-space'],
        defaults: {
          'api-name-space': process.env.ILIOS_API_NAMESPACE || 'api/v1',
          'api-host': process.env.ILIOS_API_HOST || null,
        }
      },
    };

    return ENV;
  },
};
