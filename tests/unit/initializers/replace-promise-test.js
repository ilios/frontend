import Application from '@ember/application';
import { run } from '@ember/runloop';
import { initialize } from 'ilios/initializers/replace-promise';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';

import RSVP from 'rsvp';

module('Unit | Initializer | replace promise', function(hooks) {
  hooks.beforeEach(function() {
    run(() => {
      this.application = Application.create();
      this.application.deferReadiness();
    });
  });

  hooks.afterEach(function() {
    destroyApp(this.application);
  });

  test('Global promise replaced', function(assert) {
    initialize(this.application);
    assert.ok(window.Promise === RSVP.Promise);
  });
});