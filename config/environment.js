/* eslint-env node */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ilios',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    redirectAfterShibLogin: true,
    contentSecurityPolicy: {
      'default-src': ["'none'"],
      'script-src':  ["'self'", "'unsafe-eval'"],
      'font-src':    ["'self'"],
      'connect-src': ["'self'"],
      'img-src':     ["'self'", 'data:'],
      'style-src':   ["'self'", "'unsafe-inline'"],
      'media-src':   ["'self'"]
    },
    flashMessageDefaults: {
      timeout: 2000,
      extendedTimeout: 3000,
      types: [ 'success', 'warning', 'info', 'alert' ]
    },
    'ember-simple-auth': {
      authorizer: 'authorizer:token'
    },
    'ember-simple-auth-token': {
      serverTokenEndpoint: '/auth/login',
      serverTokenRefreshEndpoint: '/auth/token',
      tokenPropertyName: 'jwt',
      authorizationHeaderName: 'X-JWT-Authorization',
      authorizationPrefix: 'Token ',
      timeFactor: 1000
    },
    i18n: {
      defaultLocale: 'en'
    },
    froalaEditorDefaults: {
      inlineMode: false,
      placeholder: '',
      allowHTML: true,
      autosave: false,
      plainPaste: true,
      spellcheck: true,
      buttons: [
        'bold',
        'italic',
        'subscript',
        'superscript',
        'insertOrderedList',
        'insertUnorderedList',
        'createLink',
        // 'html' //temporarily disabled due to bug
      ]
    },
    serverVariables: {
      tagPrefix: 'iliosconfig',
      vars: ['api-host', 'api-name-space'],
      defaults: {
        'api-name-space': 'api/v1'
      }
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
    },
    //Hide a feature while it is in development
    IliosFeatures: {
      allowAddNewUser: true,
      showUnassignedStudents: false,
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.contentSecurityPolicy['script-src'].push("'unsafe-inline'");
    ENV.redirectAfterShibLogin = false;
    ENV.IliosFeatures.showUnassignedStudents = true;
    ENV.serverVariables.defaults['api-name-space'] = 'api';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.contentSecurityPolicy['script-src'].push("'unsafe-inline'");
    ENV.flashMessageDefaults.timeout = 100;
    ENV.flashMessageDefaults.extendedTimeout = 100;
    ENV.IliosFeatures.showUnassignedStudents = true;
    ENV.serverVariables.defaults['api-name-space'] = 'api';
  }

  if (environment === 'heroku') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
  }

  //Just like dev except we can use proxy to get data from the API
  // Example for vagrant ember serve --env=proxy --proxy='http://10.10.10.10'
  if (environment === 'proxy') {
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV.contentSecurityPolicy['script-src'].push("'unsafe-inline'");
    ENV.IliosFeatures.showUnassignedStudents = true;
  }

/*
  if (environment === 'production') {
  }

  if (environment === 'staging') {
  }
*/

  return ENV;
};
