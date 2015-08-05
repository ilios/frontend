/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var env = EmberApp.env() || 'development';
  var isProductionLikeBuild = ['production', 'staging', 'heroku'].indexOf(env) > -1;

  var fingerprintOptions = {
    enabled: isProductionLikeBuild,
    prepend: ''
  };

  if(env === 'production'){
    //ilioscdn cloudfront location
    fingerprintOptions.prepend = 'https://d2eu2qqtzbi1jy.cloudfront.net/';
  }
  if(env === 'staging'){
    //ilioscdn cloudfront location
    fingerprintOptions.prepend = 'https://dbsnc1bq6jv0h.cloudfront.net/';
  }

  var app = new EmberApp(defaults, {
    fingerprint: fingerprintOptions,
    sourcemaps: {
      enabled: !isProductionLikeBuild,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
  });

  return app.toTree();
};
