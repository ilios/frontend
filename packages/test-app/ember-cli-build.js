'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
const { Webpack } = require('@embroider/webpack');

module.exports = async function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-fetch': {
      preferNative: true,
    },
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['svg']),
    },
    autoImport: {
      watchDependencies: ['ilios-common'],
    },
    sassOptions: {
      silenceDeprecations: ['mixed-decls'],
    },
    babel: {
      plugins: [
        require.resolve('ember-auto-import/babel-plugin'),
        require.resolve('ember-concurrency/async-arrow-task-transform'),
        ...require('ember-cli-code-coverage').buildBabelPlugin({ embroider: true }),
      ],
    },
  });
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
