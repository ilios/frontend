import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import config from 'frontend/config/environment';
import percySnapshot from '@percy/ember';

module('Acceptance | Update Notification', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.service = this.owner.lookup('service:new-version');
  });

  test('Noting rendered when versions match', async function (assert) {
    this.server.get('/VERSION.txt', function () {
      assert.step('version.txt called');
      return config.newVersion.currentVersion;
    });

    await visit('/');
    await this.service.updateVersion.perform();
    assert.dom('[data-test-update-notification]').doesNotExist();
    assert.verifySteps(['version.txt called']);
  });

  test('Update notification visible when versions differ', async function (assert) {
    this.server.logging = true;
    this.server.get('/VERSION.txt', function () {
      assert.step('version.txt called');
      return 'NEW';
    });

    await visit('/');
    await this.service.updateVersion.perform();
    assert.dom('[data-test-update-notification]').exists();
    await percySnapshot(assert);
    await takeScreenshot(assert);
    assert.verifySteps(['version.txt called']);
  });
});
