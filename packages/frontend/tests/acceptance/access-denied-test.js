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
      '/course/1/print',
      '/courses',
      '/courses/1',
      '/courses/1/materials',
      '/courses/1/publicationcheck',
      '/courses/1/publishall',
      '/courses/1/rollover',
      '/courses/1/sessions/1',
      '/courses/1/sessions/1/copy',
      '/courses/1/sessions/1/publicationcheck',
      '/data/courses/1',
      '/data/courses/1/instructors',
      '/data/courses/1/instructors/1',
      '/data/courses/1/objectives',
      '/data/courses/1/session-types',
      '/data/courses/1/session-types/1',
      '/data/courses/1/terms/1',
      '/data/courses/1/vocabularies',
      '/data/courses/1/vocabularies/1',
      '/reports/curriculum',
      '/reports/subjects',
      '/reports/subjects/1',
    ],
    async function (assert, url) {
      await visit(url);
      assert.strictEqual(currentURL(), '/four-oh-four');
    },
  );
});
