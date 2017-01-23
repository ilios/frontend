import Ember from 'ember';
import { initialize } from 'ilios/initializers/replace-promise';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';

import RSVP from 'rsvp';

module('Unit | Initializer | replace promise', {
  beforeEach() {
    Ember.run(() => {
      this.application = Ember.Application.create();
      this.application.deferReadiness();
    });
  },
  afterEach() {
    destroyApp(this.application);
  }
});

test('Global promise replaced', function(assert) {
  initialize(this.application);
  assert.ok(window.Promise === RSVP.Promise);
});
