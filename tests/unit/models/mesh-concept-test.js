import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | MeshConcept', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('mesh-concept');
    assert.ok(!!model);
  });
});
