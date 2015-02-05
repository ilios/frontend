/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ilios',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    adapterHost: '',
    adapterNamespace: 'api',
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self'",
      'font-src': "'self'",
      'connect-src': "'self'",
      'img-src': "'self'",
      'style-src': "'self'",
      'media-src': "'self'"
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.adapterHost = 'http://localhost:4200';
    ENV.contentSecurityPolicy['script-src'] += " 'unsafe-eval'";
  }

  if (environment === 'tryapi') {
    ENV.adapterHost = 'http://localhost:8400';
    ENV.adapterNamespace = 'app_dev.php/api/v1';
    ENV.contentSecurityPolicy['script-src'] += " 'unsafe-eval'";
    ENV.contentSecurityPolicy['connect-src'] += " localhost:8400";
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';
    ENV.adapterHost = 'http://localhost:4200';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.contentSecurityPolicy['script-src'] += " 'unsafe-eval'";
  }

  if (environment === 'production') {

  }

  return ENV;
};
