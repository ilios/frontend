import { click, find, currentPath, findAll, visit } from '@ember/test-helpers';
import { isPresent, isEmpty } from '@ember/utils';
import destroyApp from '../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1';

module('Acceptance: Program - ProgramYear List', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('check list', async function(assert) {
    server.create('program', {
      schoolId: 1
    });
    server.createList('cohort', 4);
    server.create('programYear', {
      programId: 1,
      startYear: 2012,
      cohortId: 1,
    });
    server.create('programYear', {
      programId: 1,
      startYear: 2010,
      cohortId: 2,
    });
    server.create('programYear', {
      programId: 1,
      startYear: 2011,
      cohortId: 3,
    });
    server.create('programYear', {
      programId: 1,
      startYear: 2009,
      cohortId: 4,
      archived: true
    });
    await visit(url);
    var container = find('.programyear-list');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, 3);
    assert.equal(getElementText(find(find('td'), rows.eq(0))), getText('2010 - 2011'));
    assert.equal(getElementText(find(findAll('td')[1], rows.eq(0))), getText('cohort1'));
    assert.equal(getElementText(find(find('td'), rows.eq(1))), getText('2011 - 2012'));
    assert.equal(getElementText(find(findAll('td')[1], rows.eq(1))), getText('cohort2'));
    assert.equal(getElementText(find(find('td'), rows.eq(2))), getText('2012 - 2013'));
    assert.equal(getElementText(find(findAll('td')[1], rows.eq(2))), getText('cohort0'));
  });

  test('check competencies', async function (assert) {
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1
    });
    server.createList('competency', 5, {
      programYearIds: [1]
    });
    server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(getElementText(find(findAll('.programyear-list tbody tr:eq(0) td')[2])), 5);
  });

  test('check objectives', async function(assert) {
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });
    server.createList('objective', 5, {
      programYearIds: [1]
    });
    server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(getElementText(find(findAll('.programyear-list tbody tr:eq(0) td')[3])), 5);
  });

  test('check directors', async function(assert) {
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });
    server.createList('user', 5, {
      programYearIds: [1]
    });
    server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(getElementText(find(findAll('.programyear-list tbody tr:eq(0) td')[4])), 5);
  });

  test('check terms', async function(assert) {
    server.create('program', {
      schoolId: 1,
    });

    server.create('vocabulary', {
      schoolId: 1,
      vocabularyId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });

    server.createList('term', 5, {
      programYearIds: [1],
      vocabularyId: 1,
    });
    server.create('cohort', { programYearId: 1});
    await visit(url);
    assert.equal(getElementText(find(findAll('.programyear-list tbody tr:eq(0) td')[5])), 5);
  });

  test('check warnings', async function(assert) {
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });
    server.create('cohort', { programYearId: 1});
    await visit(url);
    var tds = find('.programyear-list tbody tr:eq(0) td');
    for(let i =2; i< 6; i++){
      let icon = find('i', tds.eq(i));
      assert.ok(icon);
      assert.ok(icon.hasClass('warning'));
    }
  });

  test('check link', async function(assert) {
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
    });
    server.create('cohort', { programYearId: 1});
    await visit(url);
    await click('.programyear-list tbody tr:eq(0) td:eq(0) a');
    assert.equal(currentPath(), 'program.programYear.index');
  });

  test('can delete a program-year', async function(assert) {
    server.create('program', {
      schoolId: 1,
    });
    server.create('programYear', {
      programId: 1,
      published: false,
    });
    server.create('cohort', { programYearId: 1});
    server.create('userRole', {
      title: 'Developer',
    });
    server.db.users.update(4136, {roleIds: [1]});

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
    server.create('program', {
      schoolId: 1,
    });

    const expandButton = '.expand-collapse-button';
    const cancelButton = '.new-programyear .cancel';
    const selectField = '.startyear-select select';

    await visit(url);
    await click(expandButton);
    assert.ok(isPresent(find(selectField)), 'select menu is shown');

    await click(cancelButton);
    assert.ok(isEmpty(find(selectField)), 'select menu is hidden');
  });

  function getTableDataText(n, i, element = '') {
    return find(`.programyears .list tbody tr:eq(${n}) td:eq(${i}) ${element}`);
  }

  test('can add a program-year (with no pre-existing program-years)', async function(assert) {
    server.create('program', {
      id: 1,
      schoolId: 1,
    });

    const listRows = '.programyears .list tbody tr';
    const expandButton = '.expand-collapse-button';
    const selectField = '.startyear-select select';
    const saveButton = '.new-programyear .done';

    await visit(url);
    assert.ok(isEmpty(find(listRows)), 'there are no pre-existing program-years');

    await click(expandButton);
    const thisYear = new Date().getFullYear();
    find(selectField).eq(0).val(thisYear).change();
    await click(saveButton);
    const academicYear = `${thisYear.toString()} - ${(thisYear + 1).toString()}`;
    assert.equal(getTableDataText(0, 0).text().trim(), academicYear, 'academic year shown');
    const classOfYear = `Class of ${(thisYear + 4).toString()}`;
    assert.equal(getTableDataText(0, 1).text().trim(), classOfYear, 'cohort class year shown');
    assert.ok(getTableDataText(0, 2, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 3, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 4, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 5, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.equal(getTableDataText(0, 6, 'span').text().trim(), 'Not Published', 'unpublished shown');
  });

  test('can add a program-year (with pre-existing program-year)', async function(assert) {
    server.createList('user', 3, {
      directedProgramYearIds: [1]
    });
    server.create('school');
    server.createList('competency', 3);
    server.create('program', {
      schoolId: 1,
    });
    server.create('vocabulary', {
      schoolId: 1,
    });
    server.createList('term', 3, {
      vocabularyId: 1
    });
    server.create('objective');
    server.createList('objective', 2);
    server.create('objective', {
      ancestorId: 1,
    });
    server.create('department');
    server.create('programYearSteward', {
      departmentId: 1,
    });
    const currentYear = parseInt(moment().format('YYYY'), 10);
    server.create('programYear', {
      programId: 1,
      startYear: currentYear,
      directorIds: [2,3,4],
      competencyIds: [1,2,3],
      termIds: [1,2,3],
      objectiveIds: [2,3,4],
      stewardIds: [1],
      published: false
    });
    server.create('cohort', {
      programYearId: 1
    });

    const expandButton = '.expand-collapse-button';
    const selectField = '.startyear-select select';
    const saveButton = '.new-programyear .done';
    const thisYear = new Date().getFullYear();
    await visit(url);
    const academicYear = `${thisYear.toString()} - ${(thisYear + 1).toString()}`;

    assert.equal(getTableDataText(0, 0).text().trim(), academicYear, 'academic year shown');
    assert.equal(getTableDataText(0, 1).text().trim(), 'cohort 0', 'cohort class year shown');
    assert.equal(getTableDataText(0, 2).text().trim(), '3');
    assert.equal(getTableDataText(0, 3).text().trim(), '3');
    assert.equal(getTableDataText(0, 4).text().trim(), '3');
    assert.equal(getTableDataText(0, 5).text().trim(), '3');
    assert.equal(getTableDataText(0, 6, 'span').text().trim(), 'Not Published', 'unpublished shown');

    await click(expandButton);
    find(selectField).eq(0).val(thisYear + 1).change();
    await click(saveButton);
    const academicYear2 = `${(thisYear + 1).toString()} - ${(thisYear + 2).toString()}`;
    assert.equal(getTableDataText(1, 0).text().trim(), academicYear2, 'academic year shown');
    const cohortClassYear = `Class of ${(thisYear + 5).toString()}`;
    assert.equal(getTableDataText(1, 1).text().trim(), cohortClassYear, 'cohort class year shown');
    assert.equal(getTableDataText(1, 2).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 3).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 4).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 5).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 6, 'span').text().trim(), 'Not Published', 'unpublished shown');
  });

  test('privileged users can lock and unlock program-year', async function(assert) {
    assert.expect(6);
    const firstProgramYearRow = '.list tbody tr:eq(0)';
    const secondProgramYearRow = '.list tbody tr:eq(1)';
    const firstProgramYearLockedIcon = `${firstProgramYearRow} td:eq(6) i:eq(0)`;
    const secondProgramYearLockedIcon = `${secondProgramYearRow} td:eq(6) i:eq(0)`;
    server.create('school');
    server.create('program',  {
      schoolId: 1
    });
    server.createList('cohort', 2);
    server.create('programYear', {
      programId: 1,
      startYear: 2014,
      cohortId: 1,
      locked: true,
      directorIds: [4136],
    });
    server.create('programYear', {
      programId: 1,
      startYear: 2015,
      cohortId: 2,
      locked: false,
      directorIds: [4136],
    });
    server.create('userRole', {
      title: 'Developer'
    });
    server.db.users.update(4136, {roleIds: [1]});

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
    server.create('program', {
      schoolId: 1
    });
    server.create('programYear', {
      programId: 1,
      published: false,
    });
    server.create('cohort', {
      programYearId: 1,
    });
    server.create('user', {
      id: 1,
      cohortIds: [1]
    });
    server.create('userRole', {
      title: 'Developer',
    });
    server.db.users.update(4136, {roleIds: [1]});

    const firstProgramYearRow = '.list tbody tr:eq(0)';
    const deleteButtonOnFirstRow = `${firstProgramYearRow} .remove`;

    await visit(url);
    assert.ok(isPresent(find(firstProgramYearRow)), 'program year is visible');
    assert.ok(isEmpty(find(deleteButtonOnFirstRow)), 'no delete-button is visible');
  });
});
