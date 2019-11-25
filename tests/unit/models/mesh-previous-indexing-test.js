import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | mesh previous indexing ', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('mesh-previous-indexing');
    assert.ok(!!model);
  });
});
