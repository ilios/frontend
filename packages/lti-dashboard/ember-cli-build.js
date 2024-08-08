'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
const { Webpack } = require('@embroider/webpack');

module.exports = async function (defaults) {
  const env = EmberApp.env() || 'development';
  const isTestBuild = env === 'test';

  const config = {
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
  };
  const app = new EmberApp(defaults, config);

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    ___legacy_support: true,
  });

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticComponents: true,
  });
};
