import Ember from 'ember';
import ParentObjectiveGroupMixin from 'ilios/mixins/parent-objective-group';

module('ParentObjectiveGroupMixin');

// Replace this with your real tests.
test('it works', function() {
  var ParentObjectiveGroupObject = Ember.Object.extend(ParentObjectiveGroupMixin);
  var subject = ParentObjectiveGroupObject.create();
  ok(subject);
});
