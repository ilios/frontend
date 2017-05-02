import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
var url = '/courses/1?details=true&courseObjectiveDetails=true';
module('Acceptance: Course - Cohorts', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('academicYear', {id: 2013});
    server.create('program', {
      programYears: [1,2]
    });
    server.create('programYear', {
      program: 1,
      cohort: 1,
      objectives: [1]
    });
    server.create('programYear', {
      program: 1,
      cohort: 2,
      objectives: [2]
    });
    fixtures.parentObjective1 = server.create('objective', {
      programYears: [1],
      children: [3],
    });
    fixtures.parentObjective2 = server.create('objective', {
      programYears: [2],
      children: [3],
    });
    fixtures.courseObjective = server.create('objective', {
      courses: [1],
      parents: [1,2]
    });
    fixtures.cohorts = [];
    fixtures.cohorts.pushObject(server.create('cohort', {
      courses: [1],
      programYear: 1
    }));
    fixtures.cohorts.pushObject(server.create('cohort', {
      programYear: 2
    }));

    fixtures.course = server.create('course', {
      year: 2013,
      school: 1,
      cohorts: [1],
      objectives: [3]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list cohorts', function(assert) {
  assert.expect(4);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, fixtures.course.cohorts.length);
    for(let i = 0; i < fixtures.course.cohorts.length; i++){
      let cohort = fixtures.cohorts[fixtures.course.cohorts[i] - 1];
      assert.equal(getElementText(find('td:eq(0)', rows[i])), getText('school 0'));
      assert.equal(getElementText(find('td:eq(1)', rows[i])), getText('program 0'));
      assert.equal(getElementText(find('td:eq(2)', rows[i])), getText(cohort.title));
    }
  });
});

test('manage cohorts', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    click(find('.actions button', container));
    andThen(function(){
      assert.equal(find('.removable-list li', container).length, 1);
      assert.equal(getElementText(find('.selectable-list ul li', container)), getText('school 0 | program 0 | cohort 1'));
    });
  });
});

test('save cohort chages', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    click(find('.actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list ul li:eq(0)', container)).then(function(){
          click('button.bigadd', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)', container)), getText('school 0'));
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(1)', container)), getText('program 0'));
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(2)', container)), getText(fixtures.cohorts[1].title));
      });
    });
  });
});

test('cancel cohort changes', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    click(find('.actions button', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container)).then(function(){
        click(find('.selectable-list ul li:eq(0)', container)).then(function(){
          click('button.bigcancel', container);
        });
      });
      andThen(function(){
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)', container)), getText('school 0'));
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(1)', container)), getText('program 0'));
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(2)', container)), getText(fixtures.cohorts[0].title));
      });
    });
  });
});

test('removing a cohort remove course objectives parents linked to that cohort', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    let parents = find('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
    assert.equal(parents.length, 2);
    click('.detail-cohorts .actions button');
    andThen(function(){
      click('.detail-cohorts .removable-list li:eq(0)');
      click('.detail-cohorts button.bigadd');
      andThen(function(){
        parents = find('.course-objective-list tbody tr:eq(0) td:eq(1) .link');
        assert.equal(parents.length, 1);
        assert.equal(getElementText(parents), getText(fixtures.parentObjective2.title));
      });
    });
  });
});
