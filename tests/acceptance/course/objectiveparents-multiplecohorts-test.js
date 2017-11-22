import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
var application;
var url = '/courses/1?details=true&courseObjectiveDetails=true';
var fixtures = {};
module('Acceptance: Course with multiple Cohorts - Objective Parents', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    fixtures.program = server.create('program');
    fixtures.programYears = [];
    fixtures.programYears.pushObject(server.create('programYear', {
      programId: 1,
    }));
    fixtures.cohorts = [];
    fixtures.cohorts.pushObject(server.create('cohort', {
      programYearId: 1
    }));
    fixtures.programYears.pushObject(server.create('programYear', {
      programId: 1,
    }));
    fixtures.cohorts.pushObject(server.create('cohort', {
      programYearId: 2
    }));
    fixtures.competencies = [];
    fixtures.competencies.pushObject(server.create('competency', {
      schoolId: 1,
      programYearIds: [1,2],
    }));
    fixtures.competencies.pushObject(server.create('competency', {
      schoolId: 1,
      programYearIds: [1,2],
    }));
    fixtures.parentObjectives = [];
    fixtures.parentObjectives.pushObject(server.create('objective', {
      programYearIds: [1],
      competencyId: 1
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competencyId: 2,
      programYearIds: [1],
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competencyId: 2,
      programYearIds: [1],
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      programYearIds: [2],
      competencyId: 1
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competencyId: 2,
      programYearIds: [2],
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competencyId: 2,
      programYearIds: [2],
    }));
    fixtures.courseObjectives = [];
    fixtures.courseObjectives.pushObject(server.create('objective', {
      parentIds: [1,4]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective'));
    fixtures.course = server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [7,8],
      cohortIds: [1,2]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list parent objectives by competency', async function(assert) {
  assert.expect(27);
  await visit(url);
  let tds = find('.course-objective-list tbody tr:eq(0) td');
  assert.equal(tds.length, 4);
  await click('.link', tds.eq(1));
  let objectiveManager = find('.objective-manager').eq(0);
  let objective = fixtures.courseObjectives[0];
  assert.equal(getElementText(find('.specific-title')), 'SelectParentObjective');
  assert.equal(getElementText(find('.objectivetitle', objectiveManager)), getText(objective.title));
  let expectedCohortTitles = 'Select Parent For: ' +
    fixtures.program.title + fixtures.cohorts[0].title +
    fixtures.program.title + fixtures.cohorts[1].title;
  assert.equal(getElementText(find('.group-picker', objectiveManager)), getText(expectedCohortTitles));
  let parentPicker = find('.parent-picker', objectiveManager).eq(0);
  let competencyTitles = find('.competency-title', parentPicker);
  assert.equal(competencyTitles.length, fixtures.competencies.length);
  //every competency is in the list
  assert.equal(getElementText(competencyTitles.eq(0)), getText('competency 0'));
  assert.ok(competencyTitles.eq(0).hasClass('selected'));
  assert.equal(getElementText(competencyTitles.eq(1)), getText('competency 1'));
  assert.ok(!competencyTitles.eq(1).hasClass('selected'));

  let items = find('li', parentPicker);
  assert.equal(getElementText(items.eq(0)), getText('objective 0'));
  assert.equal(getElementText(items.eq(1)), getText('objective 1'));
  assert.equal(getElementText(items.eq(2)), getText('objective 2'));
  assert.ok(find(items.eq(0)).hasClass('selected'));
  assert.ok(!find(items.eq(1)).hasClass('selected'));
  assert.ok(!find(items.eq(2)).hasClass('selected'));

  await pickOption(find('.group-picker select', objectiveManager), 'program 0 cohort 1', assert);
  parentPicker = find('.parent-picker', objectiveManager).eq(0);
  competencyTitles = find('.competency-title', parentPicker);
  assert.equal(competencyTitles.length, fixtures.competencies.length);
  //every competency is in the list
  assert.equal(getElementText(competencyTitles.eq(0)), getText('competency 0'));
  assert.ok(competencyTitles.eq(0).hasClass('selected'));
  assert.equal(getElementText(competencyTitles.eq(1)), getText('competency 1'));
  assert.ok(!competencyTitles.eq(1).hasClass('selected'));

  items = find('li', parentPicker);
  assert.equal(getElementText(items.eq(0)), getText('objective 3'));
  assert.equal(getElementText(items.eq(1)), getText('objective 4'));
  assert.equal(getElementText(items.eq(2)), getText('objective 5'));
  assert.ok(find(items.eq(0)).hasClass('selected'));
  assert.ok(!find(items.eq(1)).hasClass('selected'));
  assert.ok(!find(items.eq(2)).hasClass('selected'));
});

test('change course objective parent', async function(assert) {
  assert.expect(10);
  await visit(url);
  let tds = find('.course-objective-list tbody tr:eq(0) td');
  await click('.link', tds.eq(1));
  let objectiveManager = find('.objective-manager').eq(0);
  let parentPicker = find('.parent-picker', objectiveManager).eq(0);
  await click('li:eq(1)', parentPicker);
  assert.ok(find('h5:eq(1)', parentPicker).hasClass('selected'));
  assert.notOk(find('h5:eq(0)', parentPicker).hasClass('selected'));
  assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
  assert.notOk(find('li:eq(0)', parentPicker).hasClass('selected'));
  await pickOption(find('.group-picker select', objectiveManager), 'program 0 cohort 1', assert);
  await click('li:eq(1)', parentPicker);
  assert.ok(find('h5:eq(1)', parentPicker).hasClass('selected'));
  assert.ok(!find('h5:eq(0)', parentPicker).hasClass('selected'));
  assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
  assert.ok(!find('li:eq(0)', parentPicker).hasClass('selected'));
  assert.ok(!find('li:eq(2)', parentPicker).hasClass('selected'));
});

test('save changes', async function(assert) {
  assert.expect(2);
  await visit(url);
  await click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
  await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
  await pickOption('.objective-manager:eq(0) .group-picker select', 'program 0 cohort 1', assert);
  await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
  await click('.detail-objectives:eq(0) button.bigadd');
  let td = find('.course-objective-list tbody tr:eq(0) td:eq(1)');
  assert.equal(getElementText(td), getText(
    'program0cohort0' +
    fixtures.parentObjectives[1].title +
    '(' + fixtures.competencies[fixtures.parentObjectives[1].competency.id - 1].title + ')' +
    'program0cohort1' +
    fixtures.parentObjectives[4].title +
    '(' + fixtures.competencies[fixtures.parentObjectives[4].competency.id - 1].title + ')'
  ));
});

test('cancel changes', async function(assert) {
  assert.expect(2);
  await visit(url);
  await click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
  await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
  await pickOption('.objective-manager:eq(0) .group-picker select', 'program 0 cohort 1', assert);
  await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
  await click('.detail-objectives:eq(0) button.bigcancel');
  let td = find('.course-objective-list tbody tr:eq(0) td:eq(1)');
  assert.equal(getElementText(td), getText(
    'program0cohort0' +
    fixtures.parentObjectives[0].title +
    '(' + fixtures.competencies[fixtures.parentObjectives[0].competency.id - 1].title + ')' +
      'program0cohort1' +
      fixtures.parentObjectives[3].title +
      '(' + fixtures.competencies[fixtures.parentObjectives[3].competency.id - 1].title + ')'
  ));
});
