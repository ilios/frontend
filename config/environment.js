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
    noScript: {
      placeIn: 'body-footer',
    },
    disableServiceWorker: [true, 'true'].includes(process.env.SW_DISABLED),
    apiNameSpace: process.env.ILIOS_FRONTEND_API_NAMESPACE ?? 'api/v3',
    apiHost: process.env.ILIOS_FRONTEND_API_HOST ?? false,
    errorCaptureEnabled:
      process.env.ILIOS_FRONTEND_ERROR_CAPTURE_ENABLED ?? environment === 'production',
    errorCaptureEnvironment: process.env.ILIOS_FRONTEND_ERROR_CAPTURE_ENVIRONMENT ?? environment,
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        Array: false,
      },
    },

    APP: {
      VERSION: version,
    },
  };

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = !!process.env.LOG_RESOLVER;
    ENV.APP.LOG_ACTIVE_GENERATION = !!process.env.LOG_ACTIVE_GENERATION;
    ENV.APP.LOG_TRANSITIONS = !!process.env.LOG_TRANSITIONS;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = !!process.env.LOG_TRANSITIONS_INTERNAL;
    ENV.APP.LOG_VIEW_LOOKUPS = !!process.env.LOG_VIEW_LOOKUPS;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.apiHost = '';
    ENV.apiNameSpace = 'api';
    ENV.disableServiceWorker = true;

    ENV.APP.autoboot = false;
  }

  return ENV;
};
