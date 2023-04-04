'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');

module.exports = function (defaults) {
  const env = EmberApp.env() || 'development';
  const isTestBuild = env === 'test';

  const app = new EmberApp(defaults, {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
      exclude: ['ilios-icon.png'],
    },
    sourcemaps: {
      enabled: true,
    },

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
