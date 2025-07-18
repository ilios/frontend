import { visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'frontend/tests/helpers';
import config from 'frontend/config/environment';
import percySnapshot from '@percy/ember';

module('Acceptance | Update Notification', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.service = this.owner.lookup('service:new-version');
  });

  test('Noting rendered when versions match', async function (assert) {
    assert.expect(1);
    this.server.get('/VERSION.txt', function () {
      return config.newVersion.currentVersion;
    });

    await visit('/');
    await this.service.updateVersion.perform();
    assert.dom('[data-test-update-notification]').doesNotExist();
  });

  test('Update notification visible when versions differ', async function (assert) {
    this.server.logging = true;
    assert.expect(1);
    this.server.get('/VERSION.txt', function () {
      return 'NEW';
    });

    await visit('/');
    await this.service.updateVersion.perform();
    assert.dom('[data-test-update-notification]').exists();
    percySnapshot(assert);
  });
});
