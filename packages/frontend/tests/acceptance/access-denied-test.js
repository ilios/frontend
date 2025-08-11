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
      '/admin/assignstudents',
      '/admin/userupdates',
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
      '/curriculum-inventory-reports',
      '/curriculum-inventory-reports/1',
      '/curriculum-inventory-reports/1/rollover',
      '/curriculum-inventory-reports/1/verification-preview',
      '/curriculum-inventory-sequence-block/1',
      '/data/courses/1',
      '/data/courses/1/instructors',
      '/data/courses/1/instructors/1',
      '/data/courses/1/objectives',
      '/data/courses/1/session-types',
      '/data/courses/1/session-types/1',
      '/data/courses/1/terms/1',
      '/data/courses/1/vocabularies',
      '/data/courses/1/vocabularies/1',
      '/data/programyears/1/objectives',
      '/data/sessiontype/1/vocabularies',
      '/data/sessiontype/1/vocabulary/1',
      '/instructorgroups',
      '/instructorgroups/1',
      '/learnergroups',
      '/learnergroups/1',
      '/programs',
      '/programs/1',
      '/programs/1/programyears/1',
      '/reports/curriculum',
      '/reports/subjects',
      '/reports/subjects/1',
      '/schools',
      '/schools/1',
      '/users/1',
      '/users',
    ],
    async function (assert, url) {
      await visit(url);
      assert.strictEqual(currentURL(), '/four-oh-four');
    },
  );
  test('user not performing non-learner functions is routed from the admin page to dashboard page', async function (assert) {
    await visit('admin');
    assert.strictEqual(currentURL(), '/dashboard/week');
  });
});
