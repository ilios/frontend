import Ember from 'ember';
import SortableObjectiveListMixin from 'ilios/mixins/sortable-objective-list';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable objective list');

test('it works', function(assert) {
  let SortableObjectiveListObject = Ember.Object.extend(SortableObjectiveListMixin);
  let subject = SortableObjectiveListObject.create();
  assert.ok(subject);
});
