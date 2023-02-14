import { module, test } from 'qunit';
import { setupTest } from 'ilios/tests/helpers';

module('Unit | Service | graphql', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:graphql');
    assert.ok(service);
  });
});
