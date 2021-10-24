import { click, fillIn, find, currentRouteName, findAll, visit } from '@ember/test-helpers';
import { isPresent, isEmpty } from '@ember/utils';
import moment from 'moment';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText } from 'ilios-common';

const url = '/programs/1';
module('Acceptance | Program - ProgramYear List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('check list', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const thisYear = new Date().getFullYear();
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.createList('cohort', 4);
    this.server.create('programYear', {
      programId: 1,
      startYear: thisYear,
      cohortId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
      startYear: thisYear - 2,
      cohortId: 2,
    });
    this.server.create('programYear', {
      programId: 1,
      startYear: thisYear - 1,
      cohortId: 3,
    });
    this.server.create('programYear', {
      programId: 1,
      startYear: thisYear - 3,
      cohortId: 4,
      archived: true,
    });
    await visit(url);

    const rows = findAll('[data-test-program-year-list] tbody tr');
    const expandButton = '.expand-collapse-button button';
    const yearOptions = '.startyear-select option';
    assert.equal(rows.length, 3);
    assert.equal(
      await getElementText(
        '[data-test-program-year-list] tbody tr:nth-of-type(1) td:nth-of-type(1)'
      ),
      `${thisYear - 2}`
    );
    assert.equal(
      await getElementText(
        '[data-test-program-year-list] tbody tr:nth-of-type(1) td:nth-of-type(2)'
      ),
      'cohort1'
    );
    assert.equal(
      await getElementText(
        '[data-test-program-year-list] tbody tr:nth-of-type(2) td:nth-of-type(1)'
      ),
      `${thisYear - 1}`
    );
    assert.equal(
      await getElementText(
        '[data-test-program-year-list] tbody tr:nth-of-type(2) td:nth-of-type(2)'
      ),
      'cohort2'
    );
    assert.equal(
      await getElementText(
        '[data-test-program-year-list] tbody tr:nth-of-type(3) td:nth-of-type(1)'
      ),
      `${thisYear}`
    );
    assert.equal(
      await getElementText(
        '[data-test-program-year-list] tbody tr:nth-of-type(3) td:nth-of-type(2)'
      ),
      'cohort0'
    );
    await click(expandButton);
    assert.dom(yearOptions).exists({ count: 6 });
  });

  test('check competencies', async function (assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.createList('competency', 5, {
      programYearIds: [1],
    });
    this.server.create('cohort', { programYearId: 1 });
    await visit(url);
    assert.equal(
      await getElementText(
        find(findAll('[data-test-program-year-list] tbody tr:nth-of-type(1) td')[2])
      ),
      5
    );
  });

  test('check objectives', async function (assert) {
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('programYear', { program });
    this.server.createList('programYearObjective', 5, { programYear });
    this.server.create('cohort', { programYear });
    await visit(url);
    assert.equal(
      await getElementText(
        find(findAll('[data-test-program-year-list] tbody tr:nth-of-type(1) td')[3])
      ),
      5
    );
  });

  test('check directors', async function (assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.createList('user', 5, {
      programYearIds: [1],
    });
    this.server.create('cohort', { programYearId: 1 });
    await visit(url);
    assert.equal(
      await getElementText(
        find(findAll('[data-test-program-year-list] tbody tr:nth-of-type(1) td')[4])
      ),
      5
    );
  });

  test('check terms', async function (assert) {
    this.server.create('program', {
      schoolId: 1,
    });

    this.server.create('vocabulary', {
      schoolId: 1,
      vocabularyId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });

    this.server.createList('term', 5, {
      programYearIds: [1],
      vocabularyId: 1,
    });
    this.server.create('cohort', { programYearId: 1 });
    await visit(url);
    assert.equal(
      await getElementText(
        find(findAll('[data-test-program-year-list] tbody tr:nth-of-type(1) td')[5])
      ),
      5
    );
  });

  test('check warnings', async function (assert) {
    assert.expect(8);
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programYearId: 1 });
    await visit(url);
    for (let i = 2; i < 6; i++) {
      const icon = find(
        `[data-test-program-year-list] tbody tr:nth-of-type(1) td:nth-of-type(${i + 1}) svg`
      );
      assert.ok(icon);
      assert.dom(icon).hasClass('fa-exclamation-triangle');
    }
  });

  test('check link', async function (assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programYearId: 1 });
    await visit(url);
    await click('[data-test-program-year-list] tbody tr:nth-of-type(1) td:nth-of-type(1) a');
    assert.equal(currentRouteName(), 'programYear.index');
  });

  test('can delete a program-year', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programYearId: 1 });

    const deleteButton = '.remove';
    const confirmRemovalButton = '.confirm-message button.remove';
    const listRows = '.list tbody tr';

    await visit(url);
    assert.ok(isPresent(find(listRows)), 'one program-year exists');

    await click(deleteButton);
    await click(confirmRemovalButton);
    assert.ok(isEmpty(find(listRows)), 'program was removed');
  });

  test('canceling adding new program-year collapses select menu', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      schoolId: 1,
    });

    const expandButton = '.expand-collapse-button button';
    const cancelButton = '[data-test-new-program-year] .cancel';
    const selectField = '.startyear-select select';

    await visit(url);
    await click(expandButton);
    assert.ok(isPresent(findAll(selectField)), 'select menu is shown');

    await click(cancelButton);
    assert.ok(isEmpty(findAll(selectField)), 'select menu is hidden');
  });

  function getTableDataText(n, i, element = '') {
    return find(
      `[data-test-years] .list tbody tr:nth-of-type(${n + 1}) td:nth-of-type(${i + 1}) ${element}`
    );
  }

  test('can add a program-year (with no pre-existing program-years)', async function (assert) {
    assert.expect(7);
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      id: 1,
      schoolId: 1,
    });

    const listRows = '[data-test-years] .list tbody tr';
    const expandButton = '.expand-collapse-button button';
    const selectField = '.startyear-select select';
    const saveButton = '[data-test-new-program-year] .done';

    await visit(url);
    assert.ok(isEmpty(findAll(listRows)), 'there are no pre-existing program-years');

    await click(expandButton);
    const thisYear = new Date().getFullYear();
    await fillIn(selectField, thisYear);
    await click(saveButton);
    assert.dom(getTableDataText(0, 0)).hasText(thisYear.toString(), 'academic year shown');
    const classOfYear = `Class of ${thisYear + 4}`;
    assert.dom(getTableDataText(0, 1)).hasText(classOfYear, 'cohort class year shown');
    assert
      .dom(getTableDataText(0, 2, 'svg'))
      .hasClass('fa-exclamation-triangle', 'warning label shown');
    assert
      .dom(getTableDataText(0, 3, 'svg'))
      .hasClass('fa-exclamation-triangle', 'warning label shown');
    assert
      .dom(getTableDataText(0, 4, 'svg'))
      .hasClass('fa-exclamation-triangle', 'warning label shown');
    assert
      .dom(getTableDataText(0, 5, 'svg'))
      .hasClass('fa-exclamation-triangle', 'warning label shown');
  });

  test('can add a program-year (with pre-existing program-year)', async function (assert) {
    assert.expect(14);
    this.user.update({ administeredSchools: [this.school] });
    const directors = this.server.createList('user', 3);
    const competencies = this.server.createList('competency', 3);
    const program = this.server.create('program', { school: this.school });
    const vocabulary = this.server.create('vocabulary', { school: this.school });
    const terms = this.server.createList('term', 3, { vocabulary });
    const currentYear = parseInt(moment().format('YYYY'), 10);
    const programYear = this.server.create('programYear', {
      program,
      startYear: currentYear,
      directors,
      competencies,
      terms,
    });
    this.server.create('cohort', { programYear });
    this.server.createList('programYearObjective', 2, { programYear });
    const ancestor = this.server.create('programYearObjective');
    this.server.create('programYearObjective', { programYear, ancestor });

    const expandButton = '.expand-collapse-button button';
    const selectField = '.startyear-select select';
    const yearOptions = '.startyear-select option';
    const saveButton = '[data-test-new-program-year] .done';
    const thisYear = new Date().getFullYear();
    await visit(url);

    assert.dom(getTableDataText(0, 0)).hasText(thisYear.toString(), 'academic year shown');
    assert.dom(getTableDataText(0, 1)).hasText('cohort 0', 'cohort class year shown');
    assert.dom(getTableDataText(0, 2)).hasText('3');
    assert.dom(getTableDataText(0, 3)).hasText('3');
    assert.dom(getTableDataText(0, 4)).hasText('3');
    assert.dom(getTableDataText(0, 5)).hasText('3');

    await click(expandButton);
    assert.dom(yearOptions).exists({ count: 9 });
    await fillIn(selectField, thisYear + 1);
    await click(saveButton);
    assert.dom(getTableDataText(1, 0)).hasText((thisYear + 1).toString(), 'academic year shown');
    const cohortClassYear = `Class of ${(thisYear + 5).toString()}`;
    assert.dom(getTableDataText(1, 1)).hasText(cohortClassYear, 'cohort class year shown');
    assert.dom(getTableDataText(1, 2)).hasText('3', 'copied correctly from latest program-year');
    assert.dom(getTableDataText(1, 3)).hasText('3', 'copied correctly from latest program-year');
    assert.dom(getTableDataText(1, 4)).hasText('3', 'copied correctly from latest program-year');
    assert.dom(getTableDataText(1, 5)).hasText('3', 'copied correctly from latest program-year');
    await click(expandButton);
    assert.dom(yearOptions).exists({ count: 8 });
  });

  test('privileged users can lock and unlock program-year', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const firstProgramYearRow = '.list tbody tr:nth-of-type(1)';
    const secondProgramYearRow = '.list tbody tr:nth-of-type(2)';
    const firstProgramYearLockedIcon = `${firstProgramYearRow} td:nth-of-type(7) svg:nth-of-type(1)`;
    const firstProgramYearUnlockButton = `${firstProgramYearRow} td:nth-of-type(7) [data-test-unlock]`;
    const secondProgramYearLockButton = `${secondProgramYearRow} td:nth-of-type(7) [data-test-lock]`;
    const secondProgramYearLockedIcon = `${secondProgramYearRow} td:nth-of-type(7) svg:nth-of-type(1)`;
    const program = this.server.create('program', {
      school: this.school,
    });
    const cohorts = this.server.createList('cohort', 2);
    this.server.create('programYear', {
      program,
      startYear: 2014,
      cohort: cohorts[0],
      locked: true,
      directorIds: [this.user.id],
    });
    this.server.create('programYear', {
      program,
      startYear: 2015,
      cohort: cohorts[1],
      locked: false,
      directorIds: [this.user.id],
    });

    await visit(url);
    assert.dom(firstProgramYearLockedIcon).hasClass('fa-lock', 'first program year is locked');
    assert
      .dom(secondProgramYearLockedIcon)
      .hasClass('fa-unlock', 'second program year is unlocked');
    await click(find(firstProgramYearUnlockButton));
    await click(find(secondProgramYearLockButton));
    assert
      .dom(firstProgramYearLockedIcon)
      .hasClass('fa-unlock', 'first program year is now unlocked');
    assert
      .dom(secondProgramYearLockedIcon)
      .hasClass('fa-lock', 'second program year is now locked');
  });

  test('delete-button is not visible for program years with populated cohorts', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const program = this.server.create('program', {
      school: this.school,
    });
    const programYear = this.server.create('programYear', {
      program,
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    this.server.create('user', {
      id: 1,
      cohorts: [cohort],
    });

    const firstProgramYearRow = '.list tbody tr:nth-of-type(1)';
    const deleteButtonOnFirstRow = `${firstProgramYearRow} .remove`;

    await visit(url);
    assert.ok(isPresent(find(firstProgramYearRow)), 'program year is visible');
    assert.ok(isEmpty(find(deleteButtonOnFirstRow)), 'no delete-button is visible');
  });
});
