'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'test-app',
    environment,
    rootURL: '/',
    locationType: 'history',
    serverVariables: {
      tagPrefix: 'iliosconfig',
      vars: ['api-host', 'api-name-space', 'error-capture-enabled'],
      defaults: {
        'api-name-space': process.env.ILIOS_FRONTEND_API_NAMESPACE || 'api/v3',
        'api-host': process.env.ILIOS_FRONTEND_API_HOST || null,
        'error-capture-enabled':
          process.env.ILIOS_FRONTEND_ERROR_CAPTURE_ENABLED || environment === 'production',
      },
    },
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    //Remove mirage in developemnt, we only use it in testing
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.serverVariables.defaults['api-name-space'] = 'api';
    ENV.serverVariables.defaults['api-host'] = '';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
