import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupAuthentication } from 'ilios-common';
import ENV from 'ilios/config/environment';
import { versionRegExp } from 'ember-cli-app-version/utils/regexp';
const { version } = ENV.APP;

module('Acceptance | footer', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.user = await setupAuthentication({ school });
  });

  test('footer displays version', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    assert.ok(apiVersion);
    await visit('/');
    const frontendVersion = version.match(versionRegExp);
    assert
      .dom('.ilios-footer .version')
      .hasText(`v1.2.3 API: ${apiVersion} Frontend: v${frontendVersion}`);
  });
});
