import { currentURL } from '@ember/test-helpers';
import { test, module } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/program-year';

module('Acceptance | Program Year - Course associations', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school }, true);
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('course', { school, cohorts: [cohort] });
    this.program = program;
    this.programYear = programYear;
  });

  test('expand and collapse course associations', async function (assert) {
    await page.visit({ programId: this.program.id, programYearId: this.programYear.id });
    await takeScreenshot(assert);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}`,
    );

    assert.ok(page.details.courseAssociations.header.title, 'Associated Courses (1)');
    assert.ok(page.details.courseAssociations.header.toggle.isCollapsed);

    await page.details.courseAssociations.header.toggle.click();
    assert.ok(page.details.courseAssociations.header.toggle.isExpanded);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}?showCourseAssociations=true`,
    );

    await page.details.courseAssociations.header.toggle.click();
    assert.ok(page.details.courseAssociations.header.toggle.isCollapsed);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}`,
    );
  });

  test('course associations are expanded if URL contains corresponding parameter', async function (assert) {
    await page.visit({
      programId: this.program.id,
      programYearId: this.programYear.id,
      showCourseAssociations: 'true',
    });
    await takeScreenshot(assert);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}?showCourseAssociations=true`,
    );
    assert.ok(page.details.courseAssociations.header.title, 'Associated Courses (1)');
    assert.ok(page.details.courseAssociations.header.toggle.isExpanded);
  });
});
