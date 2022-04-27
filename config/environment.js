'use strict';
const { existsSync } = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const dotEnvPath = path.join(__dirname, '../.env');
if (existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
}

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'ilios',
    environment,
    rootURL: '/',
    locationType: 'history',
    redirectAfterShibLogin: true,
    flashMessageDefaults: {
      timeout: 3000,
      extendedTimeout: 1000,
      types: ['success', 'warning', 'info', 'alert'],
    },
    'ember-simple-auth-token': {
      serverTokenEndpoint: '/auth/login',
      tokenPropertyName: 'jwt',
      refreshAccessTokens: false,
      authorizationPrefix: 'Token ',
    },
    i18n: {
      defaultLocale: 'en',
    },
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
    'ember-metrics': {
      includeAdapters: ['google-analytics'],
    },
    'ember-qunit-nice-errors': {
      completeExistingMessages: true,
      showFileInfo: true,
    },
    'ember-a11y-testing': {
      componentOptions: {
        turnAuditOff: process.env.SKIP_A11Y || false,
        visualNoiseLevel: 1,
      },
    },
    fontawesome: {
      enableExperimentalBuildTimeTransform: false,
      defaultPrefix: 'fas',
    },
    sentry: {
      dsn: 'https://ded7a44cf4084601a2fb468484bbe3ed@sentry.io/1311608',
      environment,
    },
    noScript: {
      placeIn: 'body-footer',
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    //Hide a feature while it is in development
    IliosFeatures: {
      programYearVisualizations: false,
    },
    featureFlags: {
      sessionLinkingAdminUi: true,
      globalSearch: true,
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.redirectAfterShibLogin = false;

    //Remove mirage in developemnt, we only use it in testing
    ENV['ember-cli-mirage'] = {
      enabled: false,
    };

    ENV.IliosFeatures.programYearVisualizations = true;

    ENV.featureFlags['globalSearch'] = true;

    //put ember concurrency tasks into debug mode to make errors much easier to spot
    ENV.EmberENV.DEBUG_TASKS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.flashMessageDefaults.timeout = 100;
    ENV.flashMessageDefaults.extendedTimeout = 100;
    ENV.serverVariables.defaults['api-name-space'] = 'api';
    ENV.serverVariables.defaults['api-host'] = '';
    ENV.featureFlags['globalSearch'] = true;

    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    if (process.env.ENABLE_PREVIEW_FEATURES) {
      ENV.IliosFeatures.programYearVisualizations = true;
      ENV.featureFlags['globalSearch'] = true;
    }
  }

  return ENV;
};
