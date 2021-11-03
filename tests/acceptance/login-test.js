import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | login', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('visiting /login', async function (assert) {
    assert.expect(2);
    await visit('/login');

    assert.strictEqual(currentURL(), '/login');
    await a11yAudit();
    assert.ok(true);
  });
});
