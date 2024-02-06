import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | preserve-scroll', function (hooks) {
  setupTest(hooks);

  test('it works', function (assert) {
    const service = this.owner.lookup('service:preserve-scroll');
    assert.ok(service);
    service.savePosition('foo', 93);
    assert.strictEqual(service.getPosition('foo'), 93);
    service.clearPosition('foo');
    assert.strictEqual(service.getPosition('foo'), 0);
    service.clearPosition('foo');
    service.clearPosition('foo');
    assert.strictEqual(service.getPosition('foo'), 0);
  });
});
