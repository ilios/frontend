import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

module('Acceptance | dashboard accessibility', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
  });

  test('meets a11y standards in default view', async function (assert) {
    await visit('/dashboard');
    assert.strictEqual(currentURL(), '/dashboard');
    await a11yAudit();
    assert.ok(true);
  });
});
