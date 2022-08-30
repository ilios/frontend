import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'dummy/tests/helpers';
import page from 'ilios-common/page-objects/course-publication-check';

module('Acceptance | Course - Publication Check', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', {
      school,
    });
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('programYear', {
      program,
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    const term = this.server.create('term', {
      vocabulary,
    });
    const meshDescriptor = this.server.create('meshDescriptor');
    this.fullCourse = this.server.create('course', {
      year: 2013,
      school,
      cohorts: [cohort],
      terms: [term],
      meshDescriptors: [meshDescriptor],
    });
    this.server.create('courseObjective', { course: this.fullCourse });
    this.emptyCourse = this.server.create('course', {
      year: 2013,
      school,
    });
  });

  test('full course count', async function (assert) {
    await page.visit({ courseId: this.fullCourse.id });
    assert.strictEqual(currentRouteName(), 'course.publication_check');
    assert.strictEqual(page.publicationcheck.courseTitle, 'course 0');
    assert.strictEqual(page.publicationcheck.cohorts, 'Yes (1)');
    assert.strictEqual(page.publicationcheck.terms, 'Yes (1)');
    assert.strictEqual(page.publicationcheck.objectives, 'Yes (1)');
    assert.strictEqual(page.publicationcheck.mesh, 'Yes (1)');
  });

  test('empty course count', async function (assert) {
    await page.visit({ courseId: this.emptyCourse.id });
    assert.strictEqual(currentRouteName(), 'course.publication_check');
    assert.strictEqual(page.publicationcheck.courseTitle, 'course 1');
    assert.strictEqual(page.publicationcheck.cohorts, 'No');
    assert.strictEqual(page.publicationcheck.terms, 'No');
    assert.strictEqual(page.publicationcheck.objectives, 'No');
    assert.strictEqual(page.publicationcheck.mesh, 'No');
  });

  test('unlink icon transitions properly', async function (assert) {
    await page.visit({ courseId: this.fullCourse.id });
    await page.publicationcheck.unlink.click();
    assert.strictEqual(currentURL(), '/courses/1?courseObjectiveDetails=true&details=true');
  });
});
