import EmberObject from '@ember/object';
import SortableByPositionMixin from 'ilios-common/mixins/sortable-by-position';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable by position', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    const SortableByPositionObject = EmberObject.extend(SortableByPositionMixin);
    const subject = SortableByPositionObject.create();
    assert.ok(subject);
  });
});
