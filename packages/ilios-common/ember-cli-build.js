'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = async function (defaults) {
  const app = new EmberAddon(defaults, {
    // Add options here
  });
  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    ___legacy_support: true,
    deprecations: {
      DEPRECATE_TRACKING_PACKAGE: false,
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
