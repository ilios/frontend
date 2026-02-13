import { currentURL } from '@ember/test-helpers';
import percySnapshot from '@percy/ember';
import { test, module } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/program-year';

module('Acceptance | Program Year - Cohort members', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [school] });
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    this.server.create('user', { cohorts: [cohort] });
    this.program = program;
    this.programYear = programYear;
  });

  test('expand and collapse cohort members', async function (assert) {
    await page.visit({ programId: this.program.id, programYearId: this.programYear.id });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}`,
    );
    assert.ok(page.details.cohortMembers.header.title, 'Members (1)');
    assert.ok(page.details.cohortMembers.header.toggle.isCollapsed);

    await page.details.cohortMembers.header.toggle.click();
    assert.ok(page.details.cohortMembers.header.toggle.isExpanded);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}?showCohortMembers=true`,
    );

    await page.details.cohortMembers.header.toggle.click();
    assert.ok(page.details.cohortMembers.header.toggle.isCollapsed);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}`,
    );
  });

  test('cohort members are expanded if URL contains corresponding parameter', async function (assert) {
    await page.visit({
      programId: this.program.id,
      programYearId: this.programYear.id,
      showCohortMembers: 'true',
    });
    await takeScreenshot(assert);
    await percySnapshot(assert);
    assert.strictEqual(
      currentURL(),
      `/programs/${this.program.id}/programyears/${this.programYear.id}?showCohortMembers=true`,
    );
    assert.ok(page.details.cohortMembers.header.title, 'Members (1)');
    assert.ok(page.details.cohortMembers.header.toggle.isExpanded);
  });
});
