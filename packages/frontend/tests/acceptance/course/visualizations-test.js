import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-visualizations';
import { setupAuthentication } from 'ilios-common';

module('Acceptance | course visualizations', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');

    const course = await this.server.create('course', {
      year: 2021,
      school: this.school,
    });
    this.user = await setupAuthentication({ directedCourses: [course] });
  });

  test('visiting /data/courses/1', async function (assert) {
    await page.visit({ courseId: 1 });
    await takeScreenshot(assert);
    assert.strictEqual(currentURL(), '/data/courses/1');
    assert.ok(page.visualizations.objectives.isVisible);
    assert.ok(page.visualizations.sessionTypes.isVisible);
    assert.ok(page.visualizations.vocabularies.isVisible);
    assert.ok(page.visualizations.instructors.isVisible);
  });
});
