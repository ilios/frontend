/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

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
    'ember-cli-babel': {
      includePolyfill: true
    },
    'ember-cli-qunit': {
      useLintTree: false
    },
    'ember-froala-editor': {
      languages: ['fr','es'],
      plugins: ['lists', 'code_view', 'link'],
      themes: 'gray'
    }
  });

  return app.toTree();
};
