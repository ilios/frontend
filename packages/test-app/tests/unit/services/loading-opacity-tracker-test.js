import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | LoadingOpacityTracker', function (hooks) {
  setupTest(hooks);

  test('it works', function (assert) {
    let service = this.owner.lookup('service:loading-opacity-tracker');
    const key = 'jaydenRules';
    assert.strictEqual(service.get(key), undefined);
    assert.false(service.has(key));
    service.set(key, 1);
    assert.true(service.has(key));
    assert.strictEqual(service.get(key), 1);
    service.set(key, 2);
    assert.strictEqual(service.get(key), 2);

    assert.ok(service);
  });
});
