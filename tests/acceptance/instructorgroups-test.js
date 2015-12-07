import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';

var application;

module('Acceptance: Instructor Groups' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /instructorgroups', function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  visit('/instructorgroups');
  andThen(function() {
    assert.equal(currentPath(), 'instructorGroups');
  });
});

test('list groups', function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    instructorGroups: [1]
  });
  server.create('course', {
    sessions: [1]
  });
  server.create('course', {
    sessions: [2]
  });
  server.create('session', {
    course: 1,
    offerings: [1]
  });
  server.create('session', {
    course: 2,
    offerings: [2]
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 1
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 2
  });
  server.create('school', {
    instructorGroups: [1,2]
  });
  var firstInstructorgroup = server.create('instructorGroup', {
    school: 1,
    users: [2,3,4,5,6],
    offerings: [1,2]
  });
  var secondInstructorgroup = server.create('instructorGroup', {
    school: 1
  });
  assert.expect(7);
  visit('/instructorgroups');
  andThen(function() {
    assert.equal(2, find('.resultslist-list tbody tr').length);
    var rows = find('.resultslist-list tbody tr');
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))),getText(firstInstructorgroup.title));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), 5);
    assert.equal(getElementText(find('td:eq(2)', rows.eq(0))), 2);

    assert.equal(getElementText(find('td:eq(0)', rows.eq(1))),getText(secondInstructorgroup.title));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), 0);
    assert.equal(getElementText(find('td:eq(2)', rows.eq(1))), 0);
  });
});

test('filters by title', function(assert) {
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1,2,3]
  });
  var firstInstructorgroup = server.create('instructorGroup', {
    title: 'specialfirstinstructorgroup',
    school: 1,
  });
  var secondInstructorgroup = server.create('instructorGroup', {
    title: 'specialsecondinstructorgroup',
    school: 1
  });
  var regularInstructorgroup = server.create('instructorGroup', {
    title: 'regularinstructorgroup',
    school: 1
  });
  assert.expect(15);
  visit('/instructorgroups');
  andThen(function() {
    assert.equal(3, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularInstructorgroup.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstInstructorgroup.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondInstructorgroup.title));

    //put these in nested later blocks because there is a 500ms debounce on the title filter
    fillIn('#titlefilter input', 'first');
    Ember.run.later(function(){
      assert.equal(1, find('.resultslist-list tbody tr').length);
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstInstructorgroup.title));
      fillIn('#titlefilter input', 'second');
      andThen(function(){
        Ember.run.later(function(){
          assert.equal(1, find('.resultslist-list tbody tr').length);
          assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondInstructorgroup.title));
          fillIn('#titlefilter input', 'special');
          andThen(function(){
            Ember.run.later(function(){
              assert.equal(2, find('.resultslist-list tbody tr').length);
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstInstructorgroup.title));
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(secondInstructorgroup.title));

              fillIn('#titlefilter input', '');
              andThen(function(){
                Ember.run.later(function(){
                  assert.equal(3, find('.resultslist-list tbody tr').length);
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularInstructorgroup.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstInstructorgroup.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondInstructorgroup.title));
                }, 750);
              });
            }, 750);
          });
        }, 750);
      });
    }, 750);
  });
});

test('add new instructorgroup', function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  assert.expect(1);
  visit('/instructorgroups');
  let newTitle = 'new test tile';
  andThen(function() {
    click('.resultslist-actions button');
    fillIn('.newinstructorgroup-title input', newTitle);
    click('.newinstructorgroup .done');
  });
  andThen(function(){
    assert.equal(getElementText(find('.savedinstructorgroup')), getText(newTitle + 'Saved Successfully'));
  });
});

test('cancel adding new instructorgroup', function(assert) {
  assert.expect(6);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  visit('/instructorgroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
    click('.resultslist-actions button').then(function(){
      assert.equal(find('.newinstructorgroup').length, 1);
      click('.newinstructorgroup .cancel');
    });
  });
  andThen(function(){
    assert.equal(find('.newinstructorgroup').length, 0);
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
  });
});

test('remove instructorgroup', function(assert) {
  assert.expect(3);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  visit('/instructorgroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      click('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(1)').then(function(){
        click('.confirm-buttons .remove');
      });
    });
  });
  andThen(function(){
    assert.equal(0, find('.resultslist-list tbody tr').length);
  });
});

test('cancel remove instructorgroup', function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  visit('/instructorgroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      click('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(1)').then(function(){
        click('.confirm-buttons .done');
      });
    });
  });
  andThen(function(){
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
  });
});

test('confirmation of remove message', function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    instructorGroups: [1]
  });
  server.create('course', {
    sessions: [1]
  });
  server.create('course', {
    sessions: [2]
  });
  server.create('session', {
    course: 1,
    offerings: [1]
  });
  server.create('session', {
    course: 2,
    offerings: [2]
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 1
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 2
  });
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
    users: [2,3,4,5,6],
    offerings: [1,2]
  });
  assert.expect(5);
  visit('/instructorgroups');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      click('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(1)').then(function(){
        assert.ok(find('.resultslist-list tbody tr:eq(0)').hasClass('confirm-removal'));
        assert.ok(find('.resultslist-list tbody tr:eq(1)').hasClass('confirm-removal'));
        assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1)')), getText('Are you sure you want to delete this instructor group, with 5 instructors and 2 courses? This action cannot be undone. Yes Cancel'));
      });
    });
  });
});

test('click edit takes you to instructorgroup route', function(assert) {
  assert.expect(2);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  visit('/instructorgroups');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      var edit = find('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(0) a');
      assert.equal(getElementText(edit), 'Edit');
      click(edit);
    });
  });
  andThen(function(){
    assert.equal(currentURL(), '/instructorgroups/1');
  });
});

test('click title takes you to instructorgroup route', function(assert) {
  assert.expect(1);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  visit('/instructorgroups');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(0) a');
  });
  andThen(function(){
    assert.equal(currentURL(), '/instructorgroups/1');
  });
});
