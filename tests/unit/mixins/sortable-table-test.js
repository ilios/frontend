import EmberObject from '@ember/object';
import SortableTableMixin from 'ilios-common/mixins/sortable-table';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable table', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const SortableTableObject = EmberObject.extend(SortableTableMixin);
    const subject = SortableTableObject.create();
    assert.ok(subject);
  });
});
