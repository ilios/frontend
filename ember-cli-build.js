'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');

module.exports = function (defaults) {
  const env = EmberApp.env() || 'development';
  const isProductionLikeBuild = ['production', 'staging', 'preview'].indexOf(env) > -1;
  const isTestBuild = env === 'test';

  const app = new EmberApp(defaults, {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
      enabled: isProductionLikeBuild,
      exclude: ['ilios-icon.png'],
    },
    sourcemaps: {
      enabled: true,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: isTestBuild,
    babel: {
      plugins: [require('ember-auto-import/babel-plugin')],
    },
    'ember-fetch': {
      preferNative: true,
    },
  });
  return app.toTree();
};
