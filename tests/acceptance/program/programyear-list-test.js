import destroyApp from '../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { isEmpty, isPresent } = Ember;

var application;
var url = '/programs/1';
module('Acceptance: Program - ProgramYear List' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check list', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1,2,3]
  });
  for(let i = 1; i <= 3; i++){
    server.create('cohort', {
      programYear: i
    });
  }
  server.create('programYear', {
    program: 1,
    startYear: 2012,
    cohort: 1,
  });
  server.create('programYear', {
    program: 1,
    startYear: 2010,
    cohort: 2,
  });
  server.create('programYear', {
    program: 1,
    startYear: 2011,
    cohort: 3,
  });
  visit(url);
  andThen(function() {
    var container = find('.programyear-list');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, 3);
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))), getText('2010 - 2011'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), getText('cohort1'));
    assert.equal(getElementText(find('td:eq(0)', rows.eq(1))), getText('2011 - 2012'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), getText('cohort2'));
    assert.equal(getElementText(find('td:eq(0)', rows.eq(2))), getText('2012 - 2013'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(2))), getText('cohort0'));
  });
});

test('check competencies', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.createList('competency', 5, {
    programYear: 1
  });
  server.create('programYear', {
    program: 1,
    competencies: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(2)')), 5);
  });
});

test('check objectives', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.createList('objective', 5, {
    programYear: 1
  });
  server.create('programYear', {
    program: 1,
    objectives: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(3)')), 5);
  });
});

test('check directors', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.createList('user', 5, {
    programYear: 1
  });
  server.create('programYear', {
    program: 1,
    directors: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(4)')), 5);
  });
});

test('check topics', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.createList('topic', 5, {
    programYear: 1
  });
  server.create('programYear', {
    program: 1,
    topics: [1,2,3,4,5]
  });
  visit(url);
  andThen(function() {
    assert.equal(getElementText(find('.programyear-list tbody tr:eq(0) td:eq(5)')), 5);
  });
});

test('check warnings', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
  });
  visit(url);
  andThen(function() {
    var tds = find('.programyear-list tbody tr:eq(0) td');
    for(let i =2; i< 6; i++){
      let icon = find('i', tds.eq(i));
      assert.ok(icon);
      assert.ok(icon.hasClass('warning'));
    }
  });
});

test('check link', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
  });
  visit(url);
  andThen(function() {
    click('.programyear-list tbody tr:eq(0) td:eq(0) a').then(function(){
      assert.equal(currentPath(), 'program.programYear.index');
    });
  });
});

test('can edit a program-year', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
  });

  const editButton = '.program-year-link';

  visit(url);
  click(editButton);
  andThen(() => {
    assert.equal(currentPath(), 'program.programYear.index');
  });
});

test('can delete a program-year', function(assert) {
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  server.create('programYear', {
    program: 1,
  });

  const deleteButton = '.program-year-link';
  const listRows = '.resultslist-list tbody tr';

  visit(url);
  andThen(() => {
    assert.ok(isPresent(find(listRows)), 'one program-year exists');
  });

  click(deleteButton);
  andThen(() => {
    assert.ok(isEmpty(find(listRows)), 'program was removed');
  });
});

test('canceling adding new program-year collapses select menu', function(assert) {
  server.create('program', {
    school: 1,
  });

  const expandButton = '.expand-collapse-button';
  const cancelButton = '.programyear-cancel';
  const selectField = '.ff-select-field';

  visit(url);
  click(expandButton);
  andThen(() => {
    assert.ok(isPresent(find(selectField)), 'select menu is shown');
  });

  click(cancelButton);
  andThen(() => {
    assert.ok(isEmpty(find(selectField)), 'select menu is hidden');
  });
});

function getTableDataText(n, i, element = '') {
  return find(`.resultslist-list tbody tr:eq(${n}) td:eq(${i}) ${element}`);
}

test('can add a program-year (with no pre-existing program-years)', function(assert) {
  server.create('program', {
    school: 1,
  });

  const listRows = '.resultslist-list tbody tr';
  const expandButton = '.expand-collapse-button';
  const selectField = '.ff-select-field';
  const option = '.ff-option:eq(5)';
  const saveButton = '.programyear-save';

  visit(url);
  andThen(() => {
    assert.ok(isEmpty(find(listRows)), 'there are no pre-existing program-years');
  });

  click(expandButton);
  click(selectField);
  click(option);
  click(saveButton);
  andThen(() => {
    const thisYear = new Date().getFullYear();
    const academicYear = `${thisYear.toString()} - ${(thisYear + 1).toString()}`;
    const classOfYear = `Class of ${(thisYear + 4).toString()}`;
    
    assert.equal(getTableDataText(0, 0).text().trim(), academicYear, 'academic year shown');
    assert.equal(getTableDataText(0, 1).text().trim(), classOfYear, 'cohort class year shown');
    assert.ok(getTableDataText(0, 2, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 3, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 4, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.ok(getTableDataText(0, 5, 'i').hasClass('fa-warning'), 'warning label shown');
    assert.equal(getTableDataText(0, 6, 'span').text().trim(), 'Not Published', 'unpublished shown');
  });
});

test('can add a program-year (with pre-existing program-year)', function(assert) {
  server.createList('user', 3, {
    directedProgramYears: [1]
  });
  server.createList('competency', 3, {
    programYears: [1]
  });
  server.createList('topic', 3, {
    programYears: [1]
  });
  server.createList('objective', 3, {
    programYears: [1]
  });
  server.create('programYearSteward', {
    department: 1,
    programYear: 1
  });
  server.create('program', {
    school: 1,
    programYears: [1]
  });
  const currentYear = parseInt(moment().format('YYYY'));
  server.create('programYear', {
    program: 1,
    startYear: currentYear,
    cohort: 1,
    directors: [2,3,4],
    competencies: [1,2,3],
    topics: [1,2,3],
    objectives: [1,2,3],
    stewards: [1],
  });
  server.create('cohort', {
    programYear: 1
  });

  const expandButton = '.expand-collapse-button';
  const selectField = '.ff-select-field';
  const option = '.ff-option:eq(5)';
  const saveButton = '.programyear-save';
  const thisYear = new Date().getFullYear();

  visit(url);
  andThen(() => {
    const academicYear = `${thisYear.toString()} - ${(thisYear + 1).toString()}`;

    assert.equal(getTableDataText(0, 0).text().trim(), academicYear, 'academic year shown');
    assert.equal(getTableDataText(0, 1).text(), 'cohort 0', 'cohort class year shown');
    assert.equal(getTableDataText(0, 2).text().trim(), '3');
    assert.equal(getTableDataText(0, 3).text().trim(), '3');
    assert.equal(getTableDataText(0, 4).text().trim(), '3');
    assert.equal(getTableDataText(0, 5).text().trim(), '3');
    assert.equal(getTableDataText(0, 6, 'span').text().trim(), 'Not Published', 'unpublished shown');
  });

  click(expandButton);
  click(selectField);
  click(option);
  click(saveButton);
  andThen(() => {
    const academicYear = `${(thisYear + 1).toString()} - ${(thisYear + 2).toString()}`;
    const cohortClassYear = `Class of ${(thisYear + 5).toString()}`;

    assert.equal(getTableDataText(1, 0).text().trim(), academicYear, 'academic year shown');
    assert.equal(getTableDataText(1, 1).text(), cohortClassYear, 'cohort class year shown');
    assert.equal(getTableDataText(1, 2).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 3).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 4).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 5).text().trim(), '3', 'copied correctly from latest program-year');
    assert.equal(getTableDataText(1, 6, 'span').text().trim(), 'Not Published', 'unpublished shown');
  });
});
