import '@warp-drive/ember/install'; // must be first in this file

import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'frontend/config/environment';
import { startSentry } from './sentry';
import { importSync, isDevelopingApp, macroCondition } from '@embroider/macros';
import { setBuildURLConfig } from '@ember-data/request-utils';

if (macroCondition(isDevelopingApp())) {
  importSync('./deprecation-workflow');
}
setBuildURLConfig({
  host: 'https://demo.iliosproject.org',
  namespace: 'api/v3'
});

startSentry(config);

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
