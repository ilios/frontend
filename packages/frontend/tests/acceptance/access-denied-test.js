import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';

module('Acceptance | Access Denied', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication();
  });

  test.each(
    'user not performing non-learner functions is routed to 404 page when accessing administrative pages',
    [
      '/courses',
      '/courses/1',
      '/courses/1/sessions/1',
      // Todo: put more routes under test here. [ST 2024/11/21]
    ],
    async function (assert, url) {
      await visit(url);
      assert.strictEqual(currentURL(), '/four-oh-four');
    },
  );
});
