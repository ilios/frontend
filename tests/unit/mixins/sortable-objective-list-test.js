import EmberObject from '@ember/object';
import SortableObjectiveListMixin from 'ilios-common/mixins/sortable-objective-list';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable objective list', function() {
  test('it works', function(assert) {
    const SortableObjectiveListObject = EmberObject.extend(SortableObjectiveListMixin);
    const subject = SortableObjectiveListObject.create();
    assert.ok(subject);
  });
});
