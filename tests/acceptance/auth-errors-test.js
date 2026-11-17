import { currentRouteName,visit } from '@ember/test-helpers';
import { setupApplicationTest,setupAuthentication } from 'frontend/tests/helpers';
import { HttpResponse } from 'msw';
import { module, test } from 'qunit';

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
  });
});
