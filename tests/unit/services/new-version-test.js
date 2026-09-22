import { module, test } from 'qunit';
import { setupTest } from 'frontend/tests/helpers';
import { setupMSW } from 'frontend/tests/msw';
import { HttpResponse } from 'msw';
import config from 'frontend/config/environment';

module('Unit | Service | new-version', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks);

  test('new version available', async function (assert) {
    const service = this.owner.lookup('service:new-version');
    assert.strictEqual(service.latestVersion, undefined);
    assert.notOk(service.isNewVersionAvailable);

    this.server.get('/VERSION.txt', function () {
      return new HttpResponse('some-version');
    });
    await service.updateVersion.perform();
    assert.strictEqual(service.latestVersion, 'some-version');
    assert.notEqual(service.latestVersion, service.currentVersion);
    assert.ok(service.isNewVersionAvailable);
  });

  test('no new version available', async function (assert) {
    const service = this.owner.lookup('service:new-version');
    assert.strictEqual(service.latestVersion, undefined);
    assert.notOk(service.isNewVersionAvailable);

    this.server.get('/VERSION.txt', function () {
      return new HttpResponse(config.APP.VERSION);
    });
    await service.updateVersion.perform();
    assert.strictEqual(service.latestVersion, config.APP.VERSION);
    assert.strictEqual(service.latestVersion, service.currentVersion);
    assert.notOk(service.isNewVersionAvailable);
  });

  test('fetching new version fails', async function (assert) {
    const service = this.owner.lookup('service:new-version');
    assert.strictEqual(service.latestVersion, undefined);
    assert.notOk(service.isNewVersionAvailable);

    this.server.get('/VERSION.txt', function () {
      return new HttpResponse(null, { status: 500 });
    });
    await service.updateVersion.perform();
    assert.strictEqual(service.latestVersion, undefined);
    assert.notEqual(service.latestVersion, service.currentVersion);
    assert.notOk(service.isNewVersionAvailable);
  });
});
