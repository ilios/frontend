'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
const { Webpack } = require('@embroider/webpack');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-fetch': {
      preferNative: true,
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true, //can be removed in ESA v5.x
    },
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['svg']),
    },
    autoImport: {
      watchDependencies: ['ilios-common'],
    },
    babel: {
      plugins: [
        require.resolve('ember-auto-import/babel-plugin'),
        // eslint-disable-next-line
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
  });
  if (process.env.BUILD_WITH_EMBROIDER) {
    return require('@embroider/compat').compatBuild(app, Webpack, {
      staticAddonTestSupportTrees: true,
      staticAddonTrees: true,
      staticHelpers: true,
      staticComponents: true,
    });
  } else {
    return app.toTree();
  }
};
