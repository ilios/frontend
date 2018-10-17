'use strict';

const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const dotEnvPath = path.join(__dirname, '../../../.env');
if (fs.existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
}

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'auto',
    i18n: {
      defaultLocale: 'en'
    },
    'ember-simple-auth-token': {
      serverTokenEndpoint: '/auth/login',
      serverTokenRefreshEndpoint: '/auth/token',
      tokenPropertyName: 'jwt',
      authorizationHeaderName: 'X-JWT-Authorization',
      authorizationPrefix: 'Token ',
      refreshLeeway: 300
    },
    serverVariables: {
      tagPrefix: 'iliosconfig',
      vars: ['api-host', 'api-name-space'],
      defaults: {
        'api-name-space': process.env.ILIOS_FRONTEND_API_NAMESPACE || 'api/v1',
        'api-host': process.env.ILIOS_FRONTEND_API_HOST || null,
      }
    },
    fontawesome: {
      enableExperimentalBuildTimeTransform: false,
      defaultPrefix: 'fas',
      icons: {
        'free-solid-svg-icons': 'all',
        'free-brands-svg-icons': [
          'black-tie'
        ],
        // 'free-solid-svg-icons': [
        //   'link',
        //   'paragraph',
        //   'file-pdf',
        //   'file-powerpoint',
        //   'file-video',
        //   'file-audio',
        //   'file',
        // ]
      }
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
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

    //Remove mirage in development, we only use it in testing
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

    ENV.serverVariables.defaults['api-name-space'] = 'api';
    ENV.serverVariables.defaults['api-host'] = '';
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
