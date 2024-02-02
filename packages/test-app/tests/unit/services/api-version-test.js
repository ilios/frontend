import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | api-version', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:api-version');
    assert.ok(service);
  });

  test('returns false when versions match', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
    const iliosConfigMock = Service.extend({
      async getApiVersion() {
        return apiVersion;
      },
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    const service = this.owner.lookup('service:api-version');
    const versionMismatch = await service.getIsMismatched();
    assert.notOk(versionMismatch);
  });

  test('returns true on version mismatch', async function (assert) {
    const iliosConfigMock = Service.extend({
      async getApiVersion() {
        return '1.0.0';
      },
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    const service = this.owner.lookup('service:api-version');
    const versionMismatch = await service.getIsMismatched();
    assert.ok(versionMismatch);
  });

  test('returns the current version', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
    const service = this.owner.lookup('service:api-version');
    assert.strictEqual(apiVersion, await service.version);
  });
});
