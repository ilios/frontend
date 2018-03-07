import { click, findAll, find, visit } from '@ember/test-helpers';
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

module('Acceptance: Course - Objective Parents', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    this.server.create('school');
    // this.server.create('academicYear', {id: 2013});
    fixtures.program = this.server.create('program');
    fixtures.programYear = this.server.create('programYear', {
      programId: 1,
    });
    fixtures.cohort = this.server.create('cohort', {
      programYearId: 1
    });
    fixtures.competencies = [];
    fixtures.competencies.pushObject(server.create('competency', {
      schoolId: 1,
      programYearIds: [1],
    }));
    fixtures.competencies.pushObject(server.create('competency', {
      schoolId: 1,
      programYearIds: [1],
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
    fixtures.courseObjectives = [];
    fixtures.courseObjectives.pushObject(server.create('objective', {
      parentIds: [1]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective'));
    fixtures.course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      objectiveIds: [4,5],
      cohortIds: [1]
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('list parent objectives by competency', async function(assert) {
    assert.expect(17);
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
    assert.ok(competencyTitles.eq(0).hasClass('selected'));
    assert.notOk(competencyTitles.eq(1).hasClass('selected'));

    //first competency
    assert.equal(getElementText(competencyTitles.eq(0)), getText('competency 0'));
    let ul = find('ul', parentPicker).eq(0);
    let items = find('li', ul);
    assert.equal(items.length, 1);
    assert.equal(getElementText(items.eq(0)), getText('objective 0'));
    assert.ok(find(items.eq(0)).classList.contains('selected'));

    //second competency
    assert.equal(getElementText(competencyTitles.eq(1)), getText('competency 1'));
    ul = find('ul', parentPicker).eq(1);
    items = find('li', ul);
    assert.equal(items.length, 2);
    assert.equal(getElementText(items.eq(0)), getText('objective 1'));
    assert.notOk(find(items.eq(0)).classList.contains('selected'));
    assert.equal(getElementText(items.eq(1)), getText('objective 2'));
    assert.notOk(find(items.eq(1)).classList.contains('selected'));
  });

  test('change course objective parent', async function(assert) {
    assert.expect(4);
    await visit(url);
    let tds = find('.course-objective-list tbody tr:eq(0) td');
    await click('.link', tds.eq(1));
    let objectiveManager = find('.objective-manager').eq(0);
    let parentPicker = find('.parent-picker', objectiveManager).eq(0);
    await click(findAll('li')[1], parentPicker);
    assert.ok(find(findAll('h5')[1], parentPicker).classList.contains('selected'));
    assert.ok(!find(find('h5'), parentPicker).classList.contains('selected'));
    assert.ok(find(findAll('li')[1], parentPicker).classList.contains('selected'));
    assert.ok(!find(find('li'), parentPicker).classList.contains('selected'));
  });

  test('save changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    await click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
    await click(findAll('.objective-manager:eq(0) .parent-picker:eq(0) li')[1]);
    await click('.detail-objectives:eq(0) button.bigadd');
    let td = find(findAll('.course-objective-list tbody tr:eq(0) td')[1]);
    assert.equal(getElementText(td), getText(
      fixtures.parentObjectives[1].title +
      '(' + fixtures.competencies[fixtures.parentObjectives[1].competency.id - 1].title + ')'
    ));
  });

  test('cancel changes', async function(assert) {
    assert.expect(1);
    await visit(url);
    await click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
    await click(findAll('.objective-manager:eq(0) .parent-picker:eq(0) li')[1]);
    await click('.detail-objectives:eq(0) button.bigcancel');
    let td = find(findAll('.course-objective-list tbody tr:eq(0) td')[1]);
    assert.equal(getElementText(td), getText(
      fixtures.parentObjectives[0].title +
      '(' + fixtures.competencies[fixtures.parentObjectives[0].competency.id - 1].title + ')'
    ));
  });
});
