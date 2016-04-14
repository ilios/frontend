/* eslint-env node */
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var env = EmberApp.env() || 'development';
  var isProductionLikeBuild = ['production', 'staging', 'heroku'].indexOf(env) > -1;

  var app = new EmberApp(defaults, {
    fingerprint: {
      enabled: isProductionLikeBuild,
      prepend: 'https://d26vzvixg52o0d.cloudfront.net/'
    },
    sourcemaps: {
      enabled: !isProductionLikeBuild,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    emberCliFontAwesome: {
      useScss: true
    },
    babel: {
      includePolyfill: true
    },
    'ember-cli-qunit': {
      useLintTree: false
    }
  });
  app.import('bower_components/froala-wysiwyg-editor/js/plugins/lists.min.js');
  app.import('bower_components/froala-wysiwyg-editor/js/plugins/code_view.min.js');
  app.import('bower_components/froala-wysiwyg-editor/js/plugins/link.min.js');

  return app.toTree();
};
