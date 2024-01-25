'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    dotEnv: {
      clientAllowedKeys: ['ILIOS_FRONTEND_API_NAMESPACE', 'ILIOS_FRONTEND_API_HOST'],
    },
    'ember-cli-babel': {
      throwUnlessParallelizable: true,
    },
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
  });

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);
};
