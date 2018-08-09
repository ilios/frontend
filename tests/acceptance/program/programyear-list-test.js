import { click, fillIn, find, currentRouteName, findAll, visit } from '@ember/test-helpers';
import { isPresent, isEmpty } from '@ember/utils';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

const url = '/programs/1';
module('Acceptance: Program - ProgramYear List', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('check list', async function(assert) {
    this.server.create('program', {
      schoolId: 1
    });
    this.server.createList('cohort', 4);
    this.server.create('programYear', {
      programId: 1,
      startYear: 2012,
      cohortId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
      startYear: 2010,
      cohortId: 2,
    });
    this.server.create('programYear', {
      programId: 1,
      startYear: 2011,
      cohortId: 3,
    });
    this.server.create('programYear', {
      programId: 1,
      startYear: 2009,
      cohortId: 4,
      archived: true
    });
    await visit(url);
    var rows = findAll('.programyear-list tbody tr');
    assert.equal(rows.length, 3);
    assert.equal(await getElementText('.programyear-list tbody tr:nth-of-type(1) td:nth-of-type(1)'), getText('2010 - 2011'));
    assert.equal(await getElementText('.programyear-list tbody tr:nth-of-type(1) td:nth-of-type(2)'), getText('cohort1'));
    assert.equal(await getElementText('.programyear-list tbody tr:nth-of-type(2) td:nth-of-type(1)'), getText('2011 - 2012'));
    assert.equal(await getElementText('.programyear-list tbody tr:nth-of-type(2) td:nth-of-type(2)'), getText('cohort2'));
    assert.equal(await getElementText('.programyear-list tbody tr:nth-of-type(3) td:nth-of-type(1)'), getText('2012 - 2013'));
    assert.equal(await getElementText('.programyear-list tbody tr:nth-of-type(3) td:nth-of-type(2)'), getText('cohort0'));
  });

  test('check competencies', async function (assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1
    });
    this.server.createList('competency', 5, {
      programYearIds: [1]
    });
    this.server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(await getElementText(find(findAll('.programyear-list tbody tr:nth-of-type(1) td')[2])), 5);
  });

  test('check objectives', async function(assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.createList('objective', 5, {
      programYearIds: [1]
    });
    this.server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(await getElementText(find(findAll('.programyear-list tbody tr:nth-of-type(1) td')[3])), 5);
  });

  test('check directors', async function(assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.createList('user', 5, {
      programYearIds: [1]
    });
    this.server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(await getElementText(find(findAll('.programyear-list tbody tr:nth-of-type(1) td')[4])), 5);
  });

  test('check terms', async function(assert) {
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
    this.server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(await getElementText(find(findAll('.programyear-list tbody tr:nth-of-type(1) td')[5])), 5);
  });

  test('check warnings', async function(assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programYearId: 1});
    await visit(url);
    for(let i =2; i< 6; i++){
      let icon = find(`.programyear-list tbody tr:nth-of-type(1) td:nth-of-type(${i+1}) i`);
      assert.ok(icon);
      assert.ok(icon.classList.contains('fa-warning'));
    }
  });

  test('check link', async function(assert) {
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programYearId: 1});
    await visit(url);
    await click('.programyear-list tbody tr:nth-of-type(1) td:nth-of-type(1) a');
    assert.equal(currentRouteName(), 'programYear.index');
  });

  test('can delete a program-year', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('programYear', {
      programId: 1,
      published: false,
    });
    this.server.create('cohort', { programYearId: 1});

    const deleteButton = '.remove';
    const confirmRemovalButton = '.confirm-message button.remove';
    const listRows = '.list tbody tr';

    await visit(url);
    assert.ok(isPresent(find(listRows)), 'one program-year exists');

    await click(deleteButton);
    await click(confirmRemovalButton);
    assert.ok(isEmpty(find(listRows)), 'program was removed');
  });

  test('canceling adding new program-year collapses select menu', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      schoolId: 1,
    });

    const expandButton = '.expand-collapse-button';
    const cancelButton = '.new-programyear .cancel';
    const selectField = '.startyear-select select';

    await visit(url);
    await click(expandButton);
    assert.ok(isPresent(findAll(selectField)), 'select menu is shown');

    await click(cancelButton);
    assert.ok(isEmpty(findAll(selectField)), 'select menu is hidden');
  });

  function getTableDataText(n, i, element = '') {
    return find(`.programyears .list tbody tr:nth-of-type(${n + 1}) td:nth-of-type(${i + 1}) ${element}`);
  }

  test('can add a program-year (with no pre-existing program-years)', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      id: 1,
      schoolId: 1,
    });

    const listRows = '.programyears .list tbody tr';
    const expandButton = '.expand-collapse-button';
    const selectField = '.startyear-select select';
    const saveButton = '.new-programyear .done';

    await visit(url);
    assert.ok(isEmpty(findAll(listRows)), 'there are no pre-existing program-years');

    await click(expandButton);
    const thisYear = new Date().getFullYear();
    await fillIn(selectField, thisYear);
    await click(saveButton);
    const academicYear = `${thisYear.toString()} - ${(thisYear + 1).toString()}`;
    assert.equal(getTableDataText(0, 0).textContent.trim(), academicYear, 'academic year shown');
    const classOfYear = `Class of ${(thisYear + 4).toString()}`;
    assert.equal(getTableDataText(0, 1).textContent.trim(), classOfYear, 'cohort class year shown');
    assert.ok(getTableDataText(0, 2, 'i').classList.contains('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 3, 'i').classList.contains('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 4, 'i').classList.contains('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 5, 'i').classList.contains('fa-warning'), 'warning label shown');
    assert.equal(getTableDataText(0, 6, 'span').textContent.trim(), 'Not Published', 'unpublished shown');
  });

  test('can add a program-year (with pre-existing program-year)', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.createList('user', 3, {
      directedProgramYearIds: [1]
    });
    this.server.create('school');
    this.server.createList('competency', 3);
    this.server.create('program', {
      schoolId: 1,
    });
    this.server.create('vocabulary', {
      schoolId: 1,
    });
    this.server.createList('term', 3, {
      vocabularyId: 1
    });
    this.server.create('objective');
    this.server.createList('objective', 2);
    this.server.create('objective', {
      ancestorId: 1,
    });
    this.server.create('department');
    this.server.create('programYearSteward', {
      departmentId: 1,
    });
    const currentYear = parseInt(moment().format('YYYY'), 10);
    this.server.create('programYear', {
      programId: 1,
      startYear: currentYear,
      directorIds: [2,3,4],
      competencyIds: [1,2,3],
      termIds: [1,2,3],
      objectiveIds: [2,3,4],
      stewardIds: [1],
      published: false
    });
    this.server.create('cohort', {
      programYearId: 1
    });

    const expandButton = '.expand-collapse-button';
    const selectField = '.startyear-select select';
    const saveButton = '.new-programyear .done';
    const thisYear = new Date().getFullYear();
    await visit(url);
    const academicYear = `${thisYear.toString()} - ${(thisYear + 1).toString()}`;

    assert.equal(getTableDataText(0, 0).textContent.trim(), academicYear, 'academic year shown');
    assert.equal(getTableDataText(0, 1).textContent.trim(), 'cohort 0', 'cohort class year shown');
    assert.equal(getTableDataText(0, 2).textContent.trim(), '3');
    assert.equal(getTableDataText(0, 3).textContent.trim(), '3');
    assert.equal(getTableDataText(0, 4).textContent.trim(), '3');
    assert.equal(getTableDataText(0, 5).textContent.trim(), '3');
    assert.equal(getTableDataText(0, 6, 'span').textContent.trim(), 'Not Published', 'unpublished shown');

    await click(expandButton);
    fillIn(selectField, thisYear + 1);
    await click(saveButton);
    const academicYear2 = `${(thisYear + 1).toString()} - ${(thisYear + 2).toString()}`;
    assert.equal(getTableDataText(1, 0).textContent.trim(), academicYear2, 'academic year shown');
    const cohortClassYear = `Class of ${(thisYear + 5).toString()}`;
    assert.equal(getTableDataText(1, 1).textContent.trim(), cohortClassYear, 'cohort class year shown');
    assert.equal(getTableDataText(1, 2).textContent.trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 3).textContent.trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 4).textContent.trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 5).textContent.trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 6, 'span').textContent.trim(), 'Not Published', 'unpublished shown');
  });

  test('privileged users can lock and unlock program-year', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(6);
    const firstProgramYearRow = '.list tbody tr:nth-of-type(1)';
    const secondProgramYearRow = '.list tbody tr:nth-of-type(2)';
    const firstProgramYearLockedIcon = `${firstProgramYearRow} td:nth-of-type(7) i:nth-of-type(1)`;
    const secondProgramYearLockedIcon = `${secondProgramYearRow} td:nth-of-type(7) i:nth-of-type(1)`;
    const program = this.server.create('program',  {
      school: this.school
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
    assert.ok(find(firstProgramYearLockedIcon).classList.contains('fa-lock'), 'first program year is locked');
    assert.ok(find(firstProgramYearLockedIcon).classList.contains('clickable'), 'first program year is clickable');
    assert.ok(find(secondProgramYearLockedIcon).classList.contains('fa-unlock'), 'second program year is unlocked');
    assert.ok(find(secondProgramYearLockedIcon).classList.contains('clickable'), 'second program year is clickable');
    await click(firstProgramYearLockedIcon);
    await click(secondProgramYearLockedIcon);
    assert.ok(find(firstProgramYearLockedIcon).classList.contains('fa-unlock'), 'first program year is now unlocked');
    assert.ok(find(secondProgramYearLockedIcon).classList.contains('fa-lock'), 'second program year is now locked');
  });

  test('delete-button is not visible for program years with populated cohorts', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    const program = this.server.create('program', {
      school: this.school
    });
    const programYear = this.server.create('programYear', {
      program,
      published: false,
    });
    const cohort = this.server.create('cohort', {
      programYear,
    });
    this.server.create('user', {
      id: 1,
      cohorts: [cohort]
    });

    const firstProgramYearRow = '.list tbody tr:nth-of-type(1)';
    const deleteButtonOnFirstRow = `${firstProgramYearRow} .remove`;

    await visit(url);
    assert.ok(isPresent(find(firstProgramYearRow)), 'program year is visible');
    assert.ok(isEmpty(find(deleteButtonOnFirstRow)), 'no delete-button is visible');
  });
});
