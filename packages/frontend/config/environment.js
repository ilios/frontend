'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'frontend',
    environment,
    rootURL: '/',
    locationType: 'history',
    redirectAfterShibLogin: true,
    flashMessageDefaults: {
      timeout: 3000,
      extendedTimeout: 1000,
      types: ['success', 'warning', 'info', 'alert'],
      injectionFactories: [],
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
        'error-capture-environment':
          process.env.ILIOS_FRONTEND_ERROR_CAPTURE_ENVIRONMENT || environment,
      },
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
    'ember-local-storage': {
      namespace: true,
      keyDelimiter: '/',
      includeEmberDataSupport: false,
    },
    fontawesome: {
      enableExperimentalBuildTimeTransform: false,
      defaultPrefix: 'fas',
    },
    sentry: {
      dsn: 'https://ded7a44cf4084601a2fb468484bbe3ed@sentry.io/1311608',
    },
    noScript: {
      placeIn: 'body-footer',
    },
    disableServiceWorker: process.env.SW_DISABLED === 'true' ?? false,
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
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    //using ember-feature-flags provided by common
    featureFlags: {
      programYearVisualizations: false,
    },
  };

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = !!process.env.LOG_RESOLVER;
    ENV.APP.LOG_ACTIVE_GENERATION = !!process.env.LOG_ACTIVE_GENERATION;
    ENV.APP.LOG_TRANSITIONS = !!process.env.LOG_TRANSITIONS;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = !!process.env.LOG_TRANSITIONS_INTERNAL;
    ENV.APP.LOG_VIEW_LOOKUPS = !!process.env.LOG_VIEW_LOOKUPS;
    ENV.redirectAfterShibLogin = false;

    ENV.featureFlags['programYearVisualizations'] = true;

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
    ENV.disableServiceWorker = true;

    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    if (process.env.ENABLE_PREVIEW_FEATURES) {
      ENV.featureFlags['programYearVisualizations'] = true;
    }
  }

  return ENV;
};
