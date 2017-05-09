import Ember from 'ember';
import PublishableModelMixin from 'ilios-common/mixins/publishable-model';
import { module, test } from 'qunit';

module('Unit | Mixin | publishable model');

// Replace this with your real tests.
test('it works', function(assert) {
  let PublishableModelObject = Ember.Object.extend(PublishableModelMixin);
  let subject = PublishableModelObject.create();
  assert.ok(subject);
});
