/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1/session/1';
module('Acceptance: Session - Independent Learning', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    fixtures.school = server.create('school', {
      instructorGroups: [1,2,3,4,5],
      courses: [1]
    });
    server.create('educationalYear');
    server.create('program', {
      programYears: [1,2]
    });
    server.create('programYear', {
      program: 1,
      cohort: 1,
    });
    server.create('programYear', {
      program: 1,
      cohort: 2,
      objectives: [2]
    });
    fixtures.learnerGroups = [];
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      ilmSession: 1,
    }));

    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      children: [5,6]
    }));
    fixtures.learnerGroups.pushObjects(server.createList('learnerGroup', 2, {
      cohort: 2
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      parent: 2,
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      parent: 2,
      children: [7]
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      parent: 6,
    }));
    fixtures.cohorts = [];
    fixtures.cohorts.pushObject(server.create('cohort', {
      courses: [1],
      programYear: 1,
      learnerGroups: [1,2,3,5]
    }));
    fixtures.cohorts.pushObject(server.create('cohort', {
      programYear: 2,
      learnerGroups: [4,5]
    }));
    fixtures.course = server.create('course', {
      cohorts: [1,2],
      owningSchool: 1
    });

    fixtures.instructorGroups = [];
    fixtures.instructorGroups.pushObjects(server.createList('instructorGroup', 3,{
      ilmSession: 1,
      school: 1
    }));
    fixtures.instructorGroups.pushObjects(server.createList('instructorGroup', 2,{
      school: 1
    }));
    fixtures.sessionType = server.create('sessionType');
    fixtures.sessionDescription = server.create('sessionDescription');
    fixtures.ilmSession = server.create('ilmSession', {
      session: 1,
      learnerGroups: [1],
      instructorGroups: [1,2,3],
    });
    fixtures.session = server.create('session', {
      course: 1,
      ilmSessionFacet: 1
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('initial selected learner groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    var selectedGroups = find('.inline-list li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.learnerGroups.length);
    for(let i = 0; i < fixtures.ilmSession.learnerGroups.length; i++){
      let expectedTitle = getText(fixtures.learnerGroups[fixtures.ilmSession.learnerGroups[i] - 1].title);
      let title = getElementText(selectedGroups.eq(i));
      assert.equal(title, expectedTitle);
    }
  });
});

test('check learner groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container);
    andThen(function(){
      var cohorts = find('.selectable-list li.static');
      assert.equal(cohorts.length, fixtures.course.cohorts.length);
      assert.equal(getElementText(cohorts.eq(0)), getText('cohort0learnergroup1learnergroup1->learnergroup4learnergroup1->learnergroup5learnergroup1->learnergroup5->learnergroup6'));
    });

  });
});

test('filter learner groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container);
    andThen(function(){
      fillIn(find('input', container), 'group 5').then(function(){
        assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1->learnergroup5learnergroup1->learnergroup5->learnergroup6'));
      });
    });
  });
});

test('add learner group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container).then(function(){
      click('.selectable-list ul li.static:eq(1) ul li:eq(0)', container);
    });
    andThen(function(){
      assert.equal(getElementText(find('.removable-list', container)), 'learnergroup0learnergroup2');
      assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1learnergroup1->learnergroup4learnergroup1->learnergroup5learnergroup1->learnergroup5->learnergroup6'));
      assert.equal(getElementText(find('.selectable-list li.static').eq(1)), getText('cohort1learnergroup3'));
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), 'learnergroup0learnergroup2');
    });
  });
});

test('add learner sub group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container).then(function(){
      click('.selectable-list ul li.static:eq(0) ul li:eq(1)', container);
    });
    andThen(function(){
      assert.equal(getElementText(find('.removable-list', container)), 'learnergroup0learnergroup1->learnergroup4');
      assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1learnergroup1->learnergroup5learnergroup1->learnergroup5->learnergroup6'));
      assert.equal(getElementText(find('.selectable-list li.static').eq(1)), getText('cohort1learnergroup2learnergroup3'));
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), 'learnergroup0learnergroup1->learnergroup4');
    });
  });
});

test('add learner group with children', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container);
    andThen(function(){
      click('.selectable-list ul li.static:eq(0) ul li:eq(0)', container);
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), 'learnergroup0learnergroup1learnergroup1->learnergroup4learnergroup1->learnergroup5learnergroup1->learnergroup5->learnergroup6');
    });
  });
});

test('add learner group with children and remove one child', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container);
    andThen(function(){
      click('.selectable-list ul li.static:eq(0) ul li:eq(0)', container);
      click('.removable-list li:eq(2)', container);
      andThen(function(){
        assert.equal(getElementText(find('.removable-list', container)), 'learnergroup0learnergroup1learnergroup1->learnergroup5learnergroup1->learnergroup5->learnergroup6');
        assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1->learnergroup4'));
        click('.bigadd', container);
      });
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), 'learnergroup0learnergroup1learnergroup1->learnergroup5learnergroup1->learnergroup5->learnergroup6');
    });
  });
});

test('remove learner group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container);
    andThen(function(){
      click('.removable-list li:eq(0)', container);
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(selectedGroups.length, 0);
    });
  });
});

test('undo learner group change', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions .add', container);
    andThen(function(){
      click('.selectable-list ul li ul li:eq(0)', container);
      click('.removable-list li:eq(0)', container);
      click('.bigcancel', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), 'learnergroup0');
    });
  });
});

test('initial selected instructor groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructorgroups');
    var selectedGroups = find('.inline-list li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
    for(let i = 0; i < fixtures.ilmSession.instructorGroups.length; i++){
      let expectedTitle = getText(fixtures.instructorGroups[fixtures.ilmSession.instructorGroups[i] - 1].title);
      let title = getElementText(selectedGroups.eq(i));
      assert.equal(title, expectedTitle);
    }
  });
});

test('check instructor groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructorgroups');
    click('.detail-actions .add', container);
    andThen(function(){
      var  selectable = find('.selectable-list ul li', container);
      assert.equal(selectable.length, 2);
      assert.equal(getElementText(selectable), getText('instructor group 3 instructor group 4'));
      var  selected = find('.removable-list li', container);
      assert.equal(selected.length, 3);
      assert.equal(getElementText(selected), getText('instructor group 0 instructor group 1 instructor group 2'));
    });

  });
});

test('add instructor group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructorgroups');
    click('.detail-actions .add', container).then(function(){
      click('.selectable-list li:eq(0)', container);
    });
    andThen(function(){
      var  selectable = find('.selectable-list ul li', container);
      assert.equal(selectable.length, 1);
      assert.equal(getElementText(selectable), getText('instructor group 4'));
      var  selected = find('.removable-list li', container);
      assert.equal(selected.length, 4);
      assert.equal(getElementText(selected), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3'));
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3'));
    });
  });
});

test('remove instructor group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructorgroups');
    click('.detail-actions .add', container);
    andThen(function(){
      click('.removable-list li:eq(0)', container);
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(selectedGroups.length, 2);
      assert.equal(getElementText(selectedGroups), getText('instructor group 1 instructor group 2'));
    });
  });
});

test('undo instructor group change', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructorgroups');
    click('.detail-actions .add', container);
    andThen(function(){
      click('.selectable-list li:eq(0)', container);
      click('.removable-list li:eq(0)', container);
      click('.bigcancel', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));
    });
  });
});
