import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | LearnerGroups ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    var route = this.owner.lookup('route:learnerGroups');
    assert.ok(route);
  });
});
