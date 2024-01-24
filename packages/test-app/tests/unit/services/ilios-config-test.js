import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | ilios config', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.get('application/config', function () {
      return {
        config: {
          type: 'authenticationType-foo',
          apiVersion: '1',
          appVersion: '3.3.3',
          userSearchType: 'userSearchType-foo',
          random: 'random-foo',
          maxUploadSize: 'maxUploadSize-foo',
          trackingEnabled: 'trackingEnabled-foo',
          trackingCode: 'trackingCode-foo',
          loginUrl: 'loginUrl-foo',
          casLoginUrl: 'casLoginUrl-foo',
        },
      };
    });
  });

  test('it exists', function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.ok(service);
  });
  test('it gets item from config', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.itemFromConfig('random'), 'random-foo');
  });
  test('it gets user search type', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getUserSearchType(), 'userSearchType-foo');
  });
  test('it gets authentication type', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getAuthenticationType(), 'authenticationType-foo');
  });
  test('it gets maxUploadSize', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getMaxUploadSize(), 'maxUploadSize-foo');
  });
  test('it gets apiVersion', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getApiVersion(), '1');
  });
  test('it gets appVersion', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getAppVersion(), '3.3.3');
  });
  test('it ignores empty appVersion', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {},
      };
    });
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getAppVersion(), '');
  });
  test('it ignores development appVersion', async function (assert) {
    this.server.get('application/config', function () {
      return {
        config: {
          appVersion: '0.1.0',
        },
      };
    });
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getAppVersion(), '');
  });
  test('it gets trackingEnabled', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getTrackingEnabled(), 'trackingEnabled-foo');
  });
  test('it gets trackingCode', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getTrackingCode(), 'trackingCode-foo');
  });
  test('it gets loginUrl', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getLoginUrl(), 'loginUrl-foo');
  });
  test('it gets casLoginUrl', async function (assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.strictEqual(await service.getCasLoginUrl(), 'casLoginUrl-foo');
  });
});
