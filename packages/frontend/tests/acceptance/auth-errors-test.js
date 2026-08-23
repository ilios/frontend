import { visit, currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { HttpResponse } from 'msw';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';

module('Acceptance | Auth Errors', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication();
  });

  test('visit index', async function (assert) {
    await visit('/');
    assert.strictEqual(currentRouteName(), 'dashboard.week');
  });

  test('request for preferences unauthorized', async function (assert) {
    this.server.get('/application/preferences', function () {
      assert.step('Unauthorized');
      return new HttpResponse('Unauthorized', {
        status: 401,
      });
    });
    await visit('/');
    assert.verifySteps(['Unauthorized']);
    assert.strictEqual(currentRouteName(), 'login');
    await takeScreenshot(assert);
  });
});
