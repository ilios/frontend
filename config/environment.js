'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'lti-app',
    environment,
    rootURL: '/',
    locationType: 'auto',
    'ember-simple-auth': {
      authorizer: 'authorizer:token',
      authenticationRoute: 'login-error',
    },
    'ember-simple-auth-token': {
      serverTokenEndpoint: '/auth/login',
      serverTokenRefreshEndpoint: '/auth/token',
      tokenPropertyName: 'jwt',
      authorizationHeaderName: 'X-JWT-Authorization',
      authorizationPrefix: 'Token ',
      refreshLeeway: 300
    },
    i18n: {
      defaultLocale: 'en'
    },
    fontawesome: {
      enableExperimentalBuildTimeTransform: false,
      defaultPrefix: 'fas',
      icons: {
        'pro-light-svg-icons': [
          'clipboard-list',
        ],
        'free-solid-svg-icons': 'all',
        'free-brands-svg-icons': [
          'black-tie',
        ],
        // //icons which are used dynamically and cannot be detected at build time
        // 'free-solid-svg-icons': [
        //   'ban',
        //   'bold',
        //   'check',
        //   'clock',
        //   'cloud',
        //   'download',
        //   'ellipsis-h',
        //   'exclamation-circle',
        //   'external-link-square-alt',
        //   'file-audio',
        //   'file-pdf',
        //   'file-powerpoint',
        //   'file-video',
        //   'file',
        //   'info-circle',
        //   'italic',
        //   'link',
        //   'list-ol',
        //   'list-ul',
        //   'paragraph',
        //   'sort-alpha-down',
        //   'sort-alpha-up',
        //   'sort-numeric-down',
        //   'sort-numeric-up',
        //   'sort',
        //   'spinner',
        //   'star',
        //   'star-half-alt',
        //   'subscript',
        //   'superscript',
        // ],
      }
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        String: true,
        Array: true,
        Function: false,
        Date: false,
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
    ENV['ember-cli-mirage'] = {
      enabled: false
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
