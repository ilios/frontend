import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Service | ilios config', function(hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.get('application/config', function() {
      return { config: {
        type: 'authenticationType-foo',
        apiVersion: '1',
        userSearchType: 'userSearchType-foo',
        random: 'random-foo',
        maxUploadSize: 'maxUploadSize-foo',
        trackingEnabled: 'trackingEnabled-foo',
        trackingCode: 'trackingCode-foo',
        loginUrl: 'loginUrl-foo',
        casLoginUrl: 'casLoginUrl-foo',
      }};
    });
  });

  test('it exists', function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.ok(service);
  });
  test('it gets item from config', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.itemFromConfig('random'), 'random-foo');
  });
  test('it gets user search type', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.userSearchType, 'userSearchType-foo');
    assert.equal(await service.getUserSearchType(), 'userSearchType-foo');
  });
  test('it gets authentication type', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.authenticationType, 'authenticationType-foo');
    assert.equal(await service.getAuthenticationType(), 'authenticationType-foo');
  });
  test('it gets maxUploadSize', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.maxUploadSize, 'maxUploadSize-foo');
    assert.equal(await service.getMaxUploadSize(), 'maxUploadSize-foo');
  });
  test('it gets apiVersion', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.apiVersion, '1');
    assert.equal(await service.getApiVersion(), '1');
  });
  test('it gets trackingEnabled', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.trackingEnabled, 'trackingEnabled-foo');
    assert.equal(await service.getTrackingEnabled(), 'trackingEnabled-foo');
  });
  test('it gets trackingCode', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.trackingCode, 'trackingCode-foo');
    assert.equal(await service.getTrackingCode(), 'trackingCode-foo');
  });
  test('it gets loginUrl', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.loginUrl, 'loginUrl-foo');
    assert.equal(await service.getLoginUrl(), 'loginUrl-foo');
  });
  test('it gets casLoginUrl', async function(assert) {
    const service = this.owner.lookup('service:ilios-config');
    assert.equal(await service.casLoginUrl, 'casLoginUrl-foo');
    assert.equal(await service.getCasLoginUrl(), 'casLoginUrl-foo');
  });
});
