import Ember from 'ember';
import PublishableMixin from '../../../mixins/publishable';
import { module, test } from 'qunit';

module('Unit | Mixin | publishable');

// Replace this with your real tests.
test('it works', function(assert) {
  var PublishableObject = Ember.Object.extend(PublishableMixin);
  var subject = PublishableObject.create();
  assert.ok(subject);
});
