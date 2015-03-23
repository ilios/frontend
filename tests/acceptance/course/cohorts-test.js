import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1?details=true';
module('Acceptance: Course - Cohorts', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('educationalYear', {id: 2013});
    server.create('program', {
      programYears: [1,2]
    });
    server.create('programYear', {
      program: 1,
      cohort: 1
    });
    server.create('programYear', {
      program: 1,
      cohort: 2
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
      owningSchool: 1,
      cohorts: [1]
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list cohorts', function(assert) {
  assert.expect(3);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, fixtures.course.cohorts.length);
    for(let i = 0; i < fixtures.course.cohorts.length; i++){
      let cohort = fixtures.cohorts[fixtures.course.cohorts[i] - 1];
      assert.equal(getElementText(find('td:eq(0)', rows[i])), getText('program 0'));
      assert.equal(getElementText(find('td:eq(1)', rows[i])), getText(cohort.title));
    }
  });
});

test('manage cohorts', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    click(find('.detail-actions .add', container));
    andThen(function(){
      assert.equal(find('.removable-list li', container).length, 1);
      assert.equal(getElementText(find('.selectable-list li ul li', container)), getText('cohort 1'));
    });
  });
});

test('save cohort chages', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    click(find('.detail-actions .add', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container));
      click(find('.selectable-list li ul li:eq(1)', container));
      click('button.bigadd', container);
      andThen(function(){
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)', container)), getText('program 0'));
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(1)', container)), getText(fixtures.cohorts[1].title));
      });
    });
  });
});

test('cancel cohort chages', function(assert) {
  assert.expect(2);
  visit(url);
  andThen(function() {
    var container = find('.detail-cohorts');
    click(find('.detail-actions .add', container));
    andThen(function(){
      click(find('.removable-list li:eq(0)', container));
      click(find('.selectable-list li ul li:eq(1)', container));
      click('button.bigcancel', container);
      andThen(function(){
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)', container)), getText('program 0'));
        assert.equal(getElementText(find('tbody tr:eq(0) td:eq(1)', container)), getText(fixtures.cohorts[0].title));
      });
    });
  });
});
