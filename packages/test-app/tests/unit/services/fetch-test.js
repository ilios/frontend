import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Service | fetch', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    class IliosConfigMock extends Service {
      apiHost = '';
    }
    this.owner.register('service:iliosConfig', IliosConfigMock);
  });

  test('getJsonFromApiHost works', async function (assert) {
    this.server.get('/ourPath', (schema, { requestHeaders }) => {
      assert.step('API called');
      assert.notOk('X-JWT-Authorization' in requestHeaders);
      return {
        a: 11,
      };
    });
    const service = this.owner.lookup('service:fetch');
    const data = await service.getJsonFromApiHost('ourPath');
    assert.deepEqual(data, { a: 11 });
    assert.verifySteps(['API called']);
  });

  test('getJsonFromApiHost sends authentication headers', async function (assert) {
    await authenticateSession({
      jwt: 'aAbBcC',
    });
    this.server.get('/ourPath', (schema, { requestHeaders }) => {
      assert.step('API called');
      assert.ok('X-JWT-Authorization' in requestHeaders);
      assert.strictEqual(requestHeaders['X-JWT-Authorization'], 'Token aAbBcC');
      return {
        a: 11,
      };
    });
    const service = this.owner.lookup('service:fetch');
    const data = await service.getJsonFromApiHost('ourPath');
    assert.deepEqual(data, { a: 11 });
    assert.verifySteps(['API called']);
  });

  test('getJsonFromApiHost removes extra slash if needed', async function (assert) {
    this.server.get('/ourPath', (schema, { requestHeaders }) => {
      assert.step('API called');
      assert.notOk('X-JWT-Authorization' in requestHeaders);
      return {
        a: 11,
      };
    });
    const service = this.owner.lookup('service:fetch');
    const data = await service.getJsonFromApiHost('/ourPath');
    assert.deepEqual(data, { a: 11 });
    assert.verifySteps(['API called']);
  });
});
