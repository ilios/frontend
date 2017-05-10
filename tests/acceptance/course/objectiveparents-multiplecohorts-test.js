import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { RSVP, run } = Ember;
const { Promise } = RSVP;

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
      cohort: 1,
      program: 1,
      objectives: [1,2,3],
      competencies: [1,2]
    }));
    fixtures.cohorts = [];
    fixtures.cohorts.pushObject(fixtures.cohort = server.create('cohort', {
      courses: [1],
      programYear: 1
    }));
    fixtures.programYears.pushObject(server.create('programYear', {
      cohort: 2,
      program: 1,
      objectives: [4,5,6],
      competencies: [1,2]
    }));
    fixtures.cohorts.pushObject(server.create('cohort', {
      courses: [1],
      programYear: 2
    }));
    fixtures.competencies = [];
    fixtures.competencies.pushObject(server.create('competency', {
      school: 1,
      programYears: [1,2],
      objectives: [1,4],
    }));
    fixtures.competencies.pushObject(server.create('competency', {
      school: 1,
      programYears: [1,2],
      objectives: [2,3,5,6],
    }));
    fixtures.parentObjectives = [];
    fixtures.parentObjectives.pushObject(server.create('objective', {
      children: [7],
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
    fixtures.parentObjectives.pushObject(server.create('objective', {
      children: [7],
      programYears: [2],
      competency: 1
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competency: 2,
      programYears: [2],
    }));
    fixtures.parentObjectives.pushObject(server.create('objective', {
      competency: 2,
      programYears: [2],
    }));
    fixtures.courseObjectives = [];
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1],
      parents: [1,4]
    }));
    fixtures.courseObjectives.pushObject(server.create('objective', {
      courses: [1]
    }));
    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      objectives: [7,8],
      cohorts: [1,2]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list parent objectives by competency', function(assert) {
  assert.expect(27);
  visit(url);
  andThen(function() {
    let tds = find('.course-objective-list tbody tr:eq(0) td');
    assert.equal(tds.length, 4);
    click('.link', tds.eq(1));
    andThen(function() {
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
      assert.ok($(items.eq(0)).hasClass('selected'));
      assert.ok(!$(items.eq(1)).hasClass('selected'));
      assert.ok(!$(items.eq(2)).hasClass('selected'));

      pickOption(find('.group-picker select', objectiveManager), 'program 0 cohort 1', assert);
      andThen(()=>{
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
        assert.ok($(items.eq(0)).hasClass('selected'));
        assert.ok(!$(items.eq(1)).hasClass('selected'));
        assert.ok(!$(items.eq(2)).hasClass('selected'));
      });
    });
  });
});

test('change course objective parent', function(assert) {
  assert.expect(9);
  return new Promise(resolve => {
    visit(url);
    andThen(() => {
      let tds = find('.course-objective-list tbody tr:eq(0) td');
      click('.link', tds.eq(1)).then(() => {
        let objectiveManager = find('.objective-manager').eq(0);
        let parentPicker = find('.parent-picker', objectiveManager).eq(0);
        let groupPicker = find('.group-picker select', objectiveManager).eq(0);
        click('li:eq(1)', parentPicker).then(() => {
          assert.ok(find('h5:eq(1)', parentPicker).hasClass('selected'));
          assert.ok(!find('h5:eq(0)', parentPicker).hasClass('selected'));
          assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
          assert.ok(!find('li:eq(0)', parentPicker).hasClass('selected'));
          groupPicker.val('2');
          groupPicker.trigger('change');
          run.later(() => {
            click('li:eq(1)', parentPicker).then(() => {
              assert.ok(find('h5:eq(1)', parentPicker).hasClass('selected'));
              assert.ok(!find('h5:eq(0)', parentPicker).hasClass('selected'));
              assert.ok(find('li:eq(1)', parentPicker).hasClass('selected'));
              assert.ok(!find('li:eq(0)', parentPicker).hasClass('selected'));
              assert.ok(!find('li:eq(2)', parentPicker).hasClass('selected'));
              resolve();
            });
          });
        });
      });
    });
  });
});

test('save changes', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
    click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)').then(()=> {
      pickOption('.objective-manager:eq(0) .group-picker select', 'program 0 cohort 1', assert);
      andThen(() => {
        click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
        click('.detail-objectives:eq(0) button.bigadd');
      });
    });
  });
  andThen(function(){
    let td = find('.course-objective-list tbody tr:eq(0) td:eq(1)');
    assert.equal(getElementText(td), getText(
      'program0cohort0' +
      fixtures.parentObjectives[1].title +
      '(' + fixtures.competencies[fixtures.parentObjectives[1].competency - 1].title + ')' +
      'program0cohort1' +
      fixtures.parentObjectives[4].title +
      '(' + fixtures.competencies[fixtures.parentObjectives[4].competency - 1].title + ')'
    ));
  });
});

test('cancel changes', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    click('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
    click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)').then(()=> {
      pickOption('.objective-manager:eq(0) .group-picker select', 'program 0 cohort 1', assert);
      andThen(() => {
        click('.objective-manager:eq(0) .parent-picker:eq(0) li:eq(1)');
        click('.detail-objectives:eq(0) button.bigcancel');
      });
    });
  });
  andThen(function(){
    let td = find('.course-objective-list tbody tr:eq(0) td:eq(1)');
    assert.equal(getElementText(td), getText(
      'program0cohort0' +
      fixtures.parentObjectives[0].title +
      '(' + fixtures.competencies[fixtures.parentObjectives[0].competency - 1].title + ')' +
        'program0cohort1' +
        fixtures.parentObjectives[3].title +
        '(' + fixtures.competencies[fixtures.parentObjectives[3].competency - 1].title + ')'
    ));
  });
});
