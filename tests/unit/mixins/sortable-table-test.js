import Ember from 'ember';
import SortableTableMixin from 'ilios/mixins/sortable-table';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable table');

// Replace this with your real tests.
test('it works', function(assert) {
  let SortableTableObject = Ember.Object.extend(SortableTableMixin);
  let subject = SortableTableObject.create();
  assert.ok(subject);
});
