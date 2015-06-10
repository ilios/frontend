/* global require, module, process */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
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

var app = new EmberApp({
  fingerprint: fingerprintOptions,
  sourcemaps: {
    enabled: !isProductionLikeBuild,
  },
  minifyCSS: { enabled: isProductionLikeBuild },
  minifyJS: { enabled: isProductionLikeBuild },

  tests: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
  hinting: process.env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
});

app.import('bower_components/ember-i18n/lib/i18n.js');
app.import('bower_components/ember-i18n/lib/i18n-plurals.js');

module.exports = app.toTree();
