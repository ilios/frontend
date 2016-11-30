/* eslint-disable no-unused-vars */
/* global QUnit */
import Ember from 'ember';
import Application from '../../app';
import config from '../../config/environment';

export default function startApp(attrs) {
  let application;

  // use defaults, but you can override
  let attributes = Ember.assign({}, config.APP, attrs);

  Ember.run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    // QUnit.config.testTimeout = 100000;
  });

  return application;
}
