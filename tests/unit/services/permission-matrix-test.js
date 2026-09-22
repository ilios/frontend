import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | permission-matrix', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:permission-matrix');
    assert.ok(service);
  });
});
