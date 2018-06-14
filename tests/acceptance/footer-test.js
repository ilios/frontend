import { module, test } from 'qunit';
import { find, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import ENV from 'ilios/config/environment';
import { versionRegExp } from 'ember-cli-app-version/utils/regexp';
const { version, apiVersion } = ENV.APP;

module('Acceptance | footer', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const school = this.server.create('school');
    this.user = await setupAuthentication({ school });
  });

  test('footer displays version', async function(assert) {
    await visit('/');
    assert.ok(find('.ilios-footer .version').textContent.includes(version.match(versionRegExp)));
    assert.ok(find('.ilios-footer .version').textContent.includes(apiVersion));
  });
});
