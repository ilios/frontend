import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Route | login', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:login');
    assert.ok(route, 'login route exists');
  });

  test('attemptSSOAuth succeeds with valid login type', async function (assert) {
    class IliosConfigMock extends Service {
      async getAuthenticationType() {
        assert.step('API called');
        return 'form';
      }
    }
    this.owner.register('service:iliosConfig', IliosConfigMock);
    const route = this.owner.lookup('route:login');
    await route.attemptSSOAuth();
    assert.verifySteps(['API called']);
  });

  test('attemptSSOAuth throws error if invalid login type is configured', async function (assert) {
    class IliosConfigMock extends Service {
      async getAuthenticationType() {
        assert.step('API called');
        return 'boofar';
      }
    }
    this.owner.register('service:iliosConfig', IliosConfigMock);
    const route = this.owner.lookup('route:login');
    try {
      await route.attemptSSOAuth();
    } catch (e) {
      assert.strictEqual(e.message, 'Login type not supported: boofar', 'error message received');
    } finally {
      assert.verifySteps(['API called']);
    }
  });
});
