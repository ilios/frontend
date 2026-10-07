'use strict';

const { version } = require('../package.json');

const API_VERSION = require('./api-version.js');

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'frontend',
    environment,
    rootURL: '/',
    locationType: 'history',
    apiVersion: API_VERSION,
    fontawesome: {
      enableExperimentalBuildTimeTransform: false,
      defaultPrefix: 'fas',
    },
    disableServiceWorker: [true, 'true'].includes(process.env.SW_DISABLED),
    apiNameSpace: process.env.ILIOS_FRONTEND_API_NAMESPACE ?? 'api/v3',
    apiHost: process.env.ILIOS_FRONTEND_API_HOST ?? false,
    errorCaptureEnabled:
      process.env.ILIOS_FRONTEND_ERROR_CAPTURE_ENABLED ?? environment === 'production',
    errorCaptureEnvironment: process.env.ILIOS_FRONTEND_ERROR_CAPTURE_ENVIRONMENT ?? environment,

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
      VERSION: version,
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;

    ENV.apiHost = '';
    ENV.apiNameSpace = 'api';
    ENV.disableServiceWorker = true;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
