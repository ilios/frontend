import {
  module,
  test
} from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/course';

module('Acceptance: Course - Cohorts', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function() {
    const school = this.server.create('school');
    this.user = await setupAuthentication({ school });
    this.server.create('academicYear', {id: 2013});
    const program = this.server.create('program', { school });
    const cohort1 = this.server.create('cohort');
    const cohort2 = this.server.create('cohort');
    const programYear1 = this.server.create('programYear', {
      program,
      cohort: cohort1,
    });
    const programYear2 = this.server.create('programYear', {
      program,
      cohort: cohort2,
    });
    const parentObjective1 = this.server.create('objective', {
      programYears: [programYear1],
    });
    const parentObjective2 = this.server.create('objective', {
      programYears: [programYear2],
    });

    const course = this.server.create('course', {
      year: 2013,
      school,
      cohorts: [programYear1.cohort], //instead of just cohort1 otherwise the relationship gets munged
    });

    this.server.create('objective', {
      courses: [course],
      parents: [parentObjective1, parentObjective2]
    });
  });

  test('list cohorts', async function (assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, details: true });
    assert.equal(page.cohorts.current().count, 1);
    assert.equal(page.cohorts.current(0).school, 'school 0');
    assert.equal(page.cohorts.current(0).program, 'program 0');
    assert.equal(page.cohorts.current(0).cohort, 'cohort 0');
  });

  test('manage cohorts', async function(assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, details: true });
    await page.cohorts.manage();
    assert.equal(page.cohorts.selected().count, 1);
    assert.equal(page.cohorts.selected(0).name, 'school 0 | program 0 | cohort 0 |');
    assert.equal(page.cohorts.selectable().count, 1);
    assert.equal(page.cohorts.selectable(0).name, 'school 0 | program 0 | cohort 1');

  });

  test('save cohort chages', async function(assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, details: true });
    await page.cohorts.manage();
    await page.cohorts.selected(0).remove();
    await page.cohorts.selectable(0).add();
    await page.cohorts.save();

    assert.equal(page.cohorts.current().count, 1);
    assert.equal(page.cohorts.current(0).school, 'school 0');
    assert.equal(page.cohorts.current(0).program, 'program 0');
    assert.equal(page.cohorts.current(0).cohort, 'cohort 1');
  });

  test('cancel cohort changes', async function(assert) {
    assert.expect(4);
    await page.visit({ courseId: 1, details: true });
    await page.cohorts.manage();
    await page.cohorts.selected(0).remove();
    await page.cohorts.selectable(0).add();
    await page.cohorts.cancel();

    assert.equal(page.cohorts.current().count, 1);
    assert.equal(page.cohorts.current(0).school, 'school 0');
    assert.equal(page.cohorts.current(0).program, 'program 0');
    assert.equal(page.cohorts.current(0).cohort, 'cohort 0');
  });

  test('removing a cohort remove course objectives parents linked to that cohort', async function(assert) {
    assert.expect(7);

    await page.visit({ courseId: 1, details: true, courseObjectiveDetails: true });
    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).parents().count, 2);
    assert.equal(page.objectives.current(0).parents(0).title, 'objective 0');
    assert.equal(page.objectives.current(0).parents(1).title, 'objective 1');

    await page.cohorts.manage();
    await page.cohorts.selected(0).remove();
    await page.cohorts.save();

    assert.equal(page.objectives.current().count, 1);
    assert.equal(page.objectives.current(0).parents().count, 1);
    assert.equal(page.objectives.current(0).parents(0).title, 'objective 1');
  });
});
