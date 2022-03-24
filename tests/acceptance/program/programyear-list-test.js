import { currentRouteName } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/program';

module('Acceptance | Program - ProgramYear List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.program = this.server.create('program', { school: this.school });
  });

  test('check list', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const thisYear = new Date().getFullYear();
    const cohorts = this.server.createList('cohort', 4);
    this.server.create('programYear', {
      program: this.program,
      startYear: thisYear,
      cohort: cohorts[0],
    });
    this.server.create('programYear', {
      program: this.program,
      startYear: thisYear - 2,
      cohort: cohorts[1],
    });
    this.server.create('programYear', {
      program: this.program,
      startYear: thisYear - 1,
      cohort: cohorts[2],
    });
    this.server.create('programYear', {
      program: this.program,
      startYear: thisYear - 3,
      cohort: cohorts[3],
      archived: true,
    });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items.length, 3);
    assert.strictEqual(page.programYears.items[0].link.text, `${thisYear - 2}`);
    assert.strictEqual(page.programYears.items[0].title, 'cohort 1');
    assert.strictEqual(page.programYears.items[1].link.text, `${thisYear - 1}`);
    assert.strictEqual(page.programYears.items[1].title, 'cohort 2');
    assert.strictEqual(page.programYears.items[2].link.text, `${thisYear}`);
    assert.strictEqual(page.programYears.items[2].title, 'cohort 0');
    await page.programYears.expandCollapse.toggle();
    assert.strictEqual(page.programYears.newProgramYear.years.options.length, 6);
  });

  test('check competencies', async function (assert) {
    const programYear = this.server.create('programYear', {
      program: this.program,
    });
    this.server.createList('competency', 5, {
      programYears: [programYear],
    });
    this.server.create('cohort', { programYear });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items[0].competencies.text, '5');
    assert.notOk(page.programYears.items[0].competencies.hasWarning);
  });

  test('check objectives', async function (assert) {
    const programYear = this.server.create('programYear', { program: this.program });
    this.server.createList('programYearObjective', 5, { programYear });
    this.server.create('cohort', { programYear });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items[0].objectives.text, '5');
    assert.notOk(page.programYears.items[0].objectives.hasWarning);
  });

  test('check directors', async function (assert) {
    const programYear = this.server.create('programYear', { program: this.program });
    this.server.createList('user', 5, {
      programYears: [programYear],
    });
    this.server.create('cohort', { programYear });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items[0].directors.text, '5');
    assert.notOk(page.programYears.items[0].directors.hasWarning);
  });

  test('check terms', async function (assert) {
    const vocabulary = this.server.create('vocabulary', {
      school: this.school,
    });
    const programYear = this.server.create('programYear', {
      program: this.program,
    });
    this.server.createList('term', 5, {
      programYears: [programYear],
      vocabulary,
    });
    this.server.create('cohort', { programYear });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items[0].terms.text, '5');
    assert.notOk(page.programYears.items[0].terms.hasWarning);
  });

  test('check warnings', async function (assert) {
    const programYear = this.server.create('programYear', {
      program: this.program,
    });
    this.server.create('cohort', { programYear });
    await page.visit({ programId: this.program.id });
    assert.ok(page.programYears.items[0].competencies.hasWarning);
    assert.ok(page.programYears.items[0].objectives.hasWarning);
    assert.ok(page.programYears.items[0].directors.hasWarning);
    assert.ok(page.programYears.items[0].terms.hasWarning);
  });

  test('check link', async function (assert) {
    const programYear = this.server.create('programYear', {
      program: this.program,
    });
    this.server.create('cohort', { programYear });
    await page.visit({ programId: this.program.id });
    await page.programYears.items[0].link.click();
    assert.strictEqual(currentRouteName(), 'programYear.index');
  });

  test('can delete a program-year', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('programYear', {
      program: this.program,
    });
    this.server.create('cohort', { programYear });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items.length, 1);
    await page.programYears.items[0].remove();
    await page.programYears.items[0].confirmRemoval.confirm();
    assert.strictEqual(page.programYears.items.length, 0);
  });

  test('canceling adding new program-year collapses new program year form', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: this.program.id });
    assert.notOk(page.programYears.newProgramYear.isVisible);
    await page.programYears.expandCollapse.toggle();
    assert.ok(page.programYears.newProgramYear.isVisible);
    await page.programYears.newProgramYear.cancel.click();
    assert.notOk(page.programYears.newProgramYear.isVisible);
  });

  test('can add a program-year (with no pre-existing program-years)', async function (assert) {
    const thisYear = new Date().getFullYear();
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items.length, 0);
    await page.programYears.expandCollapse.toggle();
    await page.programYears.newProgramYear.years.select(thisYear);
    await page.programYears.newProgramYear.done.click();
    assert.strictEqual(parseInt(page.programYears.items[0].link.text, 10), thisYear);
    assert.strictEqual(page.programYears.items[0].title, `Class of ${thisYear + 4}`);
    assert.ok(page.programYears.items[0].competencies.hasWarning);
    assert.ok(page.programYears.items[0].objectives.hasWarning);
    assert.ok(page.programYears.items[0].directors.hasWarning);
    assert.ok(page.programYears.items[0].terms.hasWarning);
  });

  test('can add a program-year (with pre-existing program-year)', async function (assert) {
    const thisYear = new Date().getFullYear();
    this.user.update({ administeredSchools: [this.school] });
    const directors = this.server.createList('user', 3);
    const competencies = this.server.createList('competency', 3);
    const vocabulary = this.server.create('vocabulary', { school: this.school });
    const terms = this.server.createList('term', 3, { vocabulary });
    const currentYear = parseInt(moment().format('YYYY'), 10);
    const programYear = this.server.create('programYear', {
      program: this.program,
      startYear: currentYear,
      directors,
      competencies,
      terms,
    });
    this.server.create('cohort', { programYear });
    this.server.createList('programYearObjective', 2, { programYear });
    const ancestor = this.server.create('programYearObjective');
    this.server.create('programYearObjective', { programYear, ancestor });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items.length, 1);
    assert.strictEqual(parseInt(page.programYears.items[0].link.text, 10), thisYear);
    assert.strictEqual(page.programYears.items[0].title, 'cohort 0');
    assert.strictEqual(page.programYears.items[0].competencies.text, '3');
    assert.strictEqual(page.programYears.items[0].objectives.text, '3');
    assert.strictEqual(page.programYears.items[0].directors.text, '3');
    assert.strictEqual(page.programYears.items[0].terms.text, '3');
    await page.programYears.expandCollapse.toggle();
    assert.strictEqual(page.programYears.newProgramYear.years.options.length, 9);
    await page.programYears.newProgramYear.years.select(thisYear + 1);
    await page.programYears.newProgramYear.done.click();
    assert.strictEqual(page.programYears.items.length, 2);
    assert.strictEqual(parseInt(page.programYears.items[1].link.text, 10), thisYear + 1);
    assert.strictEqual(page.programYears.items[1].title, `Class of ${(thisYear + 5).toString()}`);
    assert.strictEqual(page.programYears.items[1].competencies.text, '3');
    assert.strictEqual(page.programYears.items[1].objectives.text, '3');
    assert.strictEqual(page.programYears.items[1].directors.text, '3');
    assert.strictEqual(page.programYears.items[1].terms.text, '3');
    await page.programYears.expandCollapse.toggle();
    assert.strictEqual(page.programYears.newProgramYear.years.options.length, 8);
  });

  test('privileged users can lock and unlock program-year', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const cohorts = this.server.createList('cohort', 2);
    this.server.create('programYear', {
      program: this.program,
      startYear: 2014,
      cohort: cohorts[0],
      locked: true,
      directorIds: [this.user.id],
    });
    this.server.create('programYear', {
      program: this.program,
      startYear: 2015,
      cohort: cohorts[1],
      locked: false,
      directorIds: [this.user.id],
    });
    await page.visit({ programId: this.program.id });
    assert.strictEqual(page.programYears.items.length, 2);
    assert.ok(page.programYears.items[0].isLocked);
    assert.ok(page.programYears.items[1].isUnlocked);
    await page.programYears.items[0].unlock();
    await page.programYears.items[1].lock();
    assert.ok(page.programYears.items[0].isUnlocked);
    assert.ok(page.programYears.items[1].isLocked);
  });

  test('delete-button is not visible for program years with populated cohorts', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYears = this.server.createList('programYear', 2, {
      program: this.program,
    });
    const cohort = this.server.create('cohort', {
      programYear: programYears[0],
    });
    this.server.create('cohort', {
      programYear: programYears[1],
    });
    this.server.create('user', {
      cohorts: [cohort],
    });
    await page.visit({ programId: this.program.id });
    assert.notOk(page.programYears.items[0].canBeRemoved);
    assert.ok(page.programYears.items[1].canBeRemoved);
  });
});
