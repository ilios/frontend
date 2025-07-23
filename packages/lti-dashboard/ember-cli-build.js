'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
const { Webpack } = require('@embroider/webpack');

module.exports = async function (defaults) {
  const env = EmberApp.env() || 'development';
  const isTestBuild = env === 'test';

  const config = {
    emberData: {
      deprecations: {
        // New projects can safely leave this deprecation disabled.
        // If upgrading, to opt-into the deprecated behavior, set this to true and then follow:
        // https://deprecations.emberjs.com/id/ember-data-deprecate-store-extends-ember-object
        // before upgrading to Ember Data 6.0
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
      exclude: ['ilios-icon.png'],
    },
    sourcemaps: {
      enabled: true,
    },
    hinting: isTestBuild,
    sassOptions: {
      silenceDeprecations: ['mixed-decls'],
    },
    babel: {
      plugins: [...require('ember-cli-code-coverage').buildBabelPlugin({ embroider: true })],
    },
  };
  const app = new EmberApp(defaults, config);

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    compatWith: '5.2',
    deprecations: {
      DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticComponents: true,
    staticEmberSource: true,
  });
};
