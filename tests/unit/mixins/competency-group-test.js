import Ember from 'ember';
import CompetencyGroupMixin from 'ilios/mixins/competency-group';

module('CompetencyGroupMixin');

// Replace this with your real tests.
test('it works', function() {
  var CompetencyGroupObject = Ember.Object.extend(CompetencyGroupMixin);
  var subject = CompetencyGroupObject.create();
  ok(subject);
});
