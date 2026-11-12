import '@warp-drive/ember/install';
import './utils/setup-fontawesome';
import './styles/app.scss';
import './inflector';

import Application from '@ember/application';
import setupInspector from '@embroider/legacy-inspector-support/ember-source-4.12';
import { importSync, isDevelopingApp, macroCondition } from '@embroider/macros';
import compatModules from '@embroider/virtual/compat-modules';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from 'frontend/config/environment';

import { startSentry } from './sentry';

if (macroCondition(isDevelopingApp())) {
  importSync('./deprecation-workflow');
}

startSentry(config);

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
  inspector = setupInspector(this);
}

loadInitializers(App, config.modulePrefix, compatModules);
