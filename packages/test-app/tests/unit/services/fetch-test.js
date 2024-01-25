import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Unit | Service | fetch', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const iliosConfigMock = Service.extend({
      apiHost: '',
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
  });

  test('getJsonFromApiHost works', async function (assert) {
    assert.expect(2);
    this.server.get('/ourPath', (schema, { requestHeaders }) => {
      assert.notOk('X-JWT-Authorization' in requestHeaders);
      return {
        a: 11,
      };
    });
    const service = this.owner.lookup('service:fetch');
    const data = await service.getJsonFromApiHost('ourPath');
    assert.deepEqual(data, { a: 11 });
  });

  test('getJsonFromApiHost sends authentication headers', async function (assert) {
    assert.expect(3);
    await authenticateSession({
      jwt: 'aAbBcC',
    });
    this.server.get('/ourPath', (schema, { requestHeaders }) => {
      assert.ok('X-JWT-Authorization' in requestHeaders);
      assert.strictEqual(requestHeaders['X-JWT-Authorization'], 'Token aAbBcC');
      return {
        a: 11,
      };
    });
    const service = this.owner.lookup('service:fetch');
    const data = await service.getJsonFromApiHost('ourPath');
    assert.deepEqual(data, { a: 11 });
  });

  test('getJsonFromApiHost removes extra slash if needed', async function (assert) {
    assert.expect(2);
    this.server.get('/ourPath', (schema, { requestHeaders }) => {
      assert.notOk('X-JWT-Authorization' in requestHeaders);
      return {
        a: 11,
      };
    });
    const service = this.owner.lookup('service:fetch');
    const data = await service.getJsonFromApiHost('/ourPath');
    assert.deepEqual(data, { a: 11 });
  });
});
