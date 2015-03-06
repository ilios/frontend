import Ember from 'ember';
import MeshControllerMixin from 'ilios/mixins/meshcontroller';
import { module, test } from 'qunit';

module('MeshControllerMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var MeshControllerObject = Ember.Object.extend(MeshControllerMixin);
  var subject = MeshControllerObject.create();
  assert.ok(subject);
});
