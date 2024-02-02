import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Cohort', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const model = this.owner.lookup('service:store').createRecord('cohort');
    assert.ok(!!model);
  });
});
