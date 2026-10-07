import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';
import { compatBuild } from '@embroider/compat';

export default async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  const app = new EmberApp(defaults, {
    // Add options here
  });

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, import.meta.dirname, {
    compatWith: '5.2',
    deprecations: {
      // New projects can safely leave this deprecation disabled.
      // If upgrading, to opt-into the deprecated behavior, set this to true and then follow:
      // https://deprecations.emberjs.com/id/ember-data-deprecate-store-extends-ember-object
      // before upgrading to Ember Data 6.0
      DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });

  return compatBuild(app, buildOnce);
}
