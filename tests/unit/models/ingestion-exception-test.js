import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | ingestion exception ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('ingestion-exception');
    assert.ok(!!model);
  });
});
