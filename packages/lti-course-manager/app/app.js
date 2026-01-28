import '@warp-drive/ember/install';
import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'lti-course-manager/config/environment';
import { importSync, isDevelopingApp, macroCondition } from '@embroider/macros';
import 'ilios-common/utils/setup-fontawesome';

if (macroCondition(isDevelopingApp())) {
  importSync('./deprecation-workflow');
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
