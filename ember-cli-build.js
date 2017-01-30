/* eslint-env node */
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var nodeSass = require('node-sass'); // loads specific version of node-sass from package.json

module.exports = function(defaults) {
  var env = EmberApp.env() || 'development';
  var isProductionLikeBuild = ['production', 'staging', 'preview'].indexOf(env) > -1;
  var prependCloudfrontUrl = ['production', 'staging'].indexOf(env) > -1;

  var app = new EmberApp(defaults, {
    fingerprint: {
      enabled: isProductionLikeBuild,
      prepend: prependCloudfrontUrl?'https://d26vzvixg52o0d.cloudfront.net/':null
    },
    sourcemaps: {
      enabled: !isProductionLikeBuild,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    'ember-font-awesome': {
      useScss: true
    },
    babel: {
      includePolyfill: true
    },
    'ember-cli-qunit': {
      useLintTree: false
    },
    //fix for #2570
    sassOptions: {
      nodeSass: nodeSass
    }
  });
  app.import('bower_components/froala-wysiwyg-editor/js/plugins/lists.min.js');
  app.import('bower_components/froala-wysiwyg-editor/js/plugins/code_view.min.js');
  app.import('bower_components/froala-wysiwyg-editor/js/plugins/link.min.js');

  return app.toTree();
};
