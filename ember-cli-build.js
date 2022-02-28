'use strict';
/* eslint camelcase: 0 */

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {
  const app = new EmberAddon(defaults, {
    // Add options here
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
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app, {
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
