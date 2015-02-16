import {
  module,
  test
} from 'ember-qunit';
import Ember from 'ember';
import EditInPlaceMixin from 'ilios/mixins/edit-in-place';

module('EditInPlaceMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var EditInPlaceObject = Ember.Object.extend(EditInPlaceMixin);
  var subject = EditInPlaceObject.create();
  assert.ok(subject);
});
