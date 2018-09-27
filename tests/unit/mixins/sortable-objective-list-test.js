import EmberObject from '@ember/object';
import SortableObjectiveListMixin from 'ilios-common/mixins/sortable-objective-list';
import { module, test } from 'qunit';

module('Unit | Mixin | sortable objective list', function() {
  test('it works', function(assert) {
    let SortableObjectiveListObject = EmberObject.extend(SortableObjectiveListMixin);
    let subject = SortableObjectiveListObject.create();
    assert.ok(subject);
  });
});
