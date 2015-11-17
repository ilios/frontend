// jshint unused:false
/* global QUnit */
import Ember from 'ember';
import Application from '../../app';
import config from '../../config/environment';
import initializeTestHelpers from 'simple-auth-testing/test-helpers';
initializeTestHelpers();

export default function startApp(attrs) {
  let application;

  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Ember.run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    // QUnit.config.testTimeout = 100000;
  });

  return application;
}
