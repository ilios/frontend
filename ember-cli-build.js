/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let env = EmberApp.env() || 'development';
  let isProductionLikeBuild = ['production', 'staging', 'preview'].indexOf(env) > -1;

  let app = new EmberApp(defaults, {
    fingerprint: {
      enabled: isProductionLikeBuild,
    },
    sourcemaps: {
      enabled: !isProductionLikeBuild,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    'ember-cli-babel': {
      includePolyfill: true,
      sourceMaps: isProductionLikeBuild?false:'inline'
    },
    'ember-cli-qunit': {
      useLintTree: false
    },
    'ember-froala-editor': {
      languages: ['fr','es'],
      plugins: ['lists', 'code_view', 'link'],
      themes: 'gray'
    },
    'asset-cache': {
      version: '2',
      include: [
        'assets/**/*',
        'ilios-prerender/*'
      ]
    },
  });

  return app.toTree();
};
