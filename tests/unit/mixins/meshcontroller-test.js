import {
  module,
  test
} from 'ember-qunit';
import Ember from 'ember';
import MeshcontrollerMixin from 'ilios/mixins/meshcontroller';

module('MeshcontrollerMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var MeshcontrollerObject = Ember.Object.extend(MeshcontrollerMixin);
  var subject = MeshcontrollerObject.create();
  assert.ok(subject);
});
