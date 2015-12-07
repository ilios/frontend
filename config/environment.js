/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'ilios',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    adapterNamespace: 'api',
    redirectAfterShibLogin: true,
    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self'",
      'font-src': "'self'",
      'connect-src': "'self'",
      'img-src': "'self' data:",
      'style-src': "'self'",
      'media-src': "'self'"
    },
    flashMessageDefaults: {
      timeout: 2000,
      extendedTimeout: 3000,
      types: [ 'success', 'warning', 'info', 'alert' ],
      injectionFactories: []
    },
    'simple-auth': {
      authorizer: 'simple-auth-authorizer:token',
      store: 'simple-auth-session-store:cookie'
    },
    'simple-auth-token': {
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
    ENV.contentSecurityPolicy['script-src'] += " 'unsafe-eval'";
    ENV.contentSecurityPolicy['style-src'] += " 'unsafe-inline'";
    ENV.redirectAfterShibLogin = false;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.contentSecurityPolicy['script-src'] += " 'unsafe-eval'";
    ENV.contentSecurityPolicy['style-src'] += " 'unsafe-inline'";
    ENV['simple-auth'].store = 'simple-auth-session-store:ephemeral';
    ENV.flashMessageDefaults.timeout = 100;
    ENV.flashMessageDefaults.extendedTimeout = 100;
  }

  if (environment === 'heroku') {
    ENV['ember-cli-mirage'] = {
      enabled: true
    };
  }

  //Just like dev except we can use proxy to get data from the API
  // Example for vagrant ember serve --env=proxy --proxy='http://10.10.10.10'
  if (environment === 'proxy') {
    ENV.contentSecurityPolicy['script-src'] += " 'unsafe-eval'";
    ENV.contentSecurityPolicy['style-src'] += " 'unsafe-inline'";
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
    ENV.adapterNamespace = 'api/v1';

  }

  if (environment === 'production') {
    ENV.adapterNamespace = 'api/v1';
  }

  if (environment === 'staging') {
    ENV.adapterNamespace = 'api/v1';
  }

  return ENV;
};
