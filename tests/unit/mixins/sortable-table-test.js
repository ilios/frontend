import EmberObject from '@ember/object';
import SortableTableMixin from 'ilios/mixins/sortable-table';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable table', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let SortableTableObject = EmberObject.extend(SortableTableMixin);
    let subject = SortableTableObject.create();
    assert.ok(subject);
  });
});
