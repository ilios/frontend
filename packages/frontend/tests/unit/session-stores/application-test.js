import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Session Store | application', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('session-store:application');
    assert.ok(store);
  });

  test.each(
    'methods fail when no store is set',
    [
      'clear',
      'clearRedirectTarget',
      'getRedirectTarget',
      'restore',
      'setRedirectTarget',
      'persist',
    ],
    async function (assert, method) {
      let store = this.owner.lookup('session-store:application');
      assert.throws(
        () => store[method](),
        new RegExp(`active store must exist before calling ${method}`),
        'works as expected',
      );
    },
  );
});
