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
    fontawesome: {
      enableExperimentalBuildTimeTransform: false,
      defaultPrefix: 'fas',
    },
    sentry: {
      dsn: 'https://ded7a44cf4084601a2fb468484bbe3ed@sentry.io/1311608',
    },
    noScript: {
      content:
        "<p class='font-size-xxl'>For full functionality of this site it is necessary to enable JavaScript. Here are the <a href='https://www.enable-javascript.com/' target='_blank'>instructions on how to enable JavaScript in your web browser</a>.</p>",
      placeIn: 'body-footer',
    },
    disableServiceWorker: [true, 'true'].includes(process.env.SW_DISABLED),
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
      DEFAULTS: {
        localStorage: {
          locale: 'en-us',
        },
      },
      LOCAL_STORAGE_KEY: 'ilios',
      SUPPORTED_LOCALES: ['en-us', 'es', 'fr'],
    },
  };

  if (environment === 'development') {
    ENV.APP.LOG_RESOLVER = !!process.env.LOG_RESOLVER;
    ENV.APP.LOG_ACTIVE_GENERATION = !!process.env.LOG_ACTIVE_GENERATION;
    ENV.APP.LOG_TRANSITIONS = !!process.env.LOG_TRANSITIONS;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = !!process.env.LOG_TRANSITIONS_INTERNAL;
    ENV.APP.LOG_VIEW_LOOKUPS = !!process.env.LOG_VIEW_LOOKUPS;
    ENV.redirectAfterShibLogin = false;

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

  return ENV;
};
