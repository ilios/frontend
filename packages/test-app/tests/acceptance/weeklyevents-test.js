import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'test-app/tests/helpers';
import page from 'ilios-common/page-objects/weeklyevents';

module('Acceptance | Weekly events', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
  });

  test('back link is visible', async function (assert) {
    await page.visit();
    assert.ok(page.backLink.isPresent);
  });
});
