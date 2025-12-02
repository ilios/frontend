import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import percySnapshot from '@percy/ember';

module('Acceptance | login', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /login', async function (assert) {
    await visit('/login');
    await takeScreenshot(assert);
    await percySnapshot(assert);

    assert.strictEqual(currentURL(), '/login');
    await a11yAudit();
    assert.ok(true);
  });
});
