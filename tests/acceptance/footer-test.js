import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest, setupAuthentication } from 'frontend/tests/helpers';
import config from 'frontend/config/environment';

module('Acceptance | footer', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    this.user = await setupAuthentication({ school });
  });

  test('footer displays version', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
    await visit('/');
    assert
      .dom('.ilios-footer .version')
      .hasText(`v1.2.3 API: ${apiVersion} Frontend: v${config.APP.VERSION}`);
  });
});
