/* global require, module, process */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var fingerprintOptions = {
  enabled: false,
  prepend: ''
};

var env = process.env.EMBER_ENV || 'development';

if(env === 'production'){
  fingerprintOptions.enabled = true;
  //ilioscdn cloudfront location
  fingerprintOptions.prepend = 'https://d2eu2qqtzbi1jy.cloudfront.net/';
}

if(env === 'heroku'){
  fingerprintOptions.enabled = true;
}

var app = new EmberApp({
  fingerprint: fingerprintOptions,
});

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('bower_components/ember-i18n/lib/i18n.js');
app.import('bower_components/ember-i18n/lib/i18n-plurals.js');

module.exports = app.toTree();
