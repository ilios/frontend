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
module('Acceptance: Course - Objective Parents', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    // server.create('academicYear', {id: 2013});
    fixtures.program = server.create('program');
    fixtures.programYear = server.create('programYear', {
      cohort: 1,
      program: 1,
      objectives: [1,2,3],
      competencies: [1,2]
    });
    fixtures.cohort = server.create('cohort', {
      courses: [1],
      programYear: 1
    });
    fixtures.competencies = [];
    fixtures.competencies.pushObject(server.create('competency', {
      school: 1,
      programYears: [1],
      objectives: [1],
    }));
    fixtures.competencies.pushObject(server.create('competency', {
      school: 1,
      programYears: [1],
      objectives: [2,3],
    }));
    fixtures.parentObjectives = [];
    fixtures.parentObjectives.pushObject(server.create('objective', {
      children: [4],
      programYears: [1],
      competency: 1
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competency: 2,
      programYears: [1],
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competency: 2,
      programYears: [1],
    }));
    fixtures.courseObjectives = [];
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1],
      parents: [1]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1]
    }));
    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      objectives: [4,5],
      cohorts: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list parent objectives by competency', async function(assert) {
  assert.expect(16);
  await visit(url);
  let tds = find('.course-objective-list tbody tr:eq(0) td');
  assert.equal(tds.length, 4);
  await click('.link', tds.eq(1));

  let objectiveManager = find('.objective-manager').eq(0);
  let objective = fixtures.courseObjectives[0];
  assert.equal(getElementText(find('.specific-title')), 'SelectParentObjective');
  assert.equal(getElementText(find('.objectivetitle', objectiveManager)), getText(objective.title));
  let expectedCohortTitle = 'Select Parent For: ' + fixtures.program.title + fixtures.cohort.title;
  assert.equal(getElementText(find('.group-picker', objectiveManager)), getText(expectedCohortTitle));
  let parentPicker = find('.parent-picker', objectiveManager).eq(0);
  let competencyTitles = find('.competency-title', parentPicker);
  assert.equal(competencyTitles.length, fixtures.competencies.length);
  //every competency is in the list
  for(let i = 0; i < fixtures.programYear.competencies.length; i++){
    let competency = fixtures.competencies[fixtures.programYear.competencies[i] - 1];
    assert.equal(getElementText(competencyTitles.eq(i)), getText(competency.title));
    let ul = find('ul', parentPicker).eq(i);
    let items = find('li', ul);
    let cohortObjectives = competency.objectives;
    assert.equal(cohortObjectives.length, cohortObjectives.length);
    for (let j = 0; j < cohortObjectives.length; j++){
      let li = items.eq(j);
      assert.equal(getElementText(li), getText(fixtures.parentObjectives[cohortObjectives[j] - 1].title));
      if(objective.parents.indexOf(cohortObjectives[j]) !== -1){
        assert.ok(competencyTitles.eq(i).hasClass('selected'));
        assert.ok($(li).hasClass('selected'));
      } else {
        assert.ok(!$(li).hasClass('selected'));
      }
    }
  }
});

test('change course objective parent', async function(assert) {
  assert.expect(4);
  await visit(url);
  let tds = find('.course-objective-list tbody tr:eq(0) td');
  await click('.link', tds.eq(1));
  let objectiveManager = find('.objective-manager').eq(0);
  let parentPicker = find('.parent-picker', objectiveManager).eq(0);
  await click('li:eq(1)', parentPicker);
  assert.ok(find('h5:eq(1)', parentPicker).hasClass('selected'));
  assert.ok(!find('h5:eq(0)', parentPicker).hasClass('selected'));
  assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
  assert.ok(!find('li:eq(0)', parentPicker).hasClass('selected'));
});

test('save changes', async function(assert) {
  assert.expect(1);
  await visit(url);
  await click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
  await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
  await click('.detail-objectives:eq(0) button.bigadd');
  let td = find('.course-objective-list tbody tr:eq(0) td:eq(1)');
  assert.equal(getElementText(td), getText(
    fixtures.parentObjectives[1].title +
    '(' + fixtures.competencies[fixtures.parentObjectives[1].competency - 1].title + ')'
  ));
});

test('cancel changes', async function(assert) {
  assert.expect(1);
  await visit(url);
  await click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
  await click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
  await click('.detail-objectives:eq(0) button.bigcancel');
  let td = find('.course-objective-list tbody tr:eq(0) td:eq(1)');
  assert.equal(getElementText(td), getText(
    fixtures.parentObjectives[0].title +
    '(' + fixtures.competencies[fixtures.parentObjectives[0].competency - 1].title + ')'
  ));
});
