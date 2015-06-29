import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: Programs', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /programs', function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  visit('/programs');
  andThen(function() {
    assert.equal(currentPath(), 'programs');
  });
});

test('filters by title', function(assert) {
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1,2,3]
  });
  var firstProgram = server.create('program', {
    title: 'specialfirstprogram',
    owningSchool: 1,
  });
  var secondProgram = server.create('program', {
    title: 'specialsecondprogram',
    owningSchool: 1
  });
  var regularProgram = server.create('program', {
    title: 'regularprogram',
    owningSchool: 1
  });
  assert.expect(15);
  visit('/programs');
  andThen(function() {
    assert.equal(3, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularProgram.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstProgram.title));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondProgram.title));

    //put these in nested later blocks because there is a 500ms debounce on the title filter
    fillIn('#titlefilter input', 'first');
    Ember.run.later(function(){
      assert.equal(1, find('.resultslist-list tbody tr').length);
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstProgram.title));
      fillIn('#titlefilter input', 'second');
      andThen(function(){
        Ember.run.later(function(){
          assert.equal(1, find('.resultslist-list tbody tr').length);
          assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(secondProgram.title));
          fillIn('#titlefilter input', 'special');
          andThen(function(){
            Ember.run.later(function(){
              assert.equal(2, find('.resultslist-list tbody tr').length);
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(firstProgram.title));
              assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(secondProgram.title));

              fillIn('#titlefilter input', '');
              andThen(function(){
                Ember.run.later(function(){
                  assert.equal(3, find('.resultslist-list tbody tr').length);
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText(regularProgram.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)')),getText(firstProgram.title));
                  assert.equal(getElementText(find('.resultslist-list tbody tr:eq(2) td:eq(0)')),getText(secondProgram.title));
                }, 750);
              });
            }, 750);
          });
        }, 750);
      });
    }, 750);
  });
});

test('add new program', function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  assert.expect(3);
  visit('/programs');
  andThen(function() {
    click('.resultslist-actions button');
    fillIn('.newprogram input', 'new test title');
    click('.newprogram .done');
  });
  andThen(function(){
    assert.equal(currentPath(), 'program.index');
    assert.equal(getElementText(find('.title .content')), getText('new test title'));
    assert.equal(getElementText(find('.programduration div')), 4);
  });
});

test('cancel adding new program', function(assert) {
  assert.expect(6);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    owningSchool: 1,
  });
  visit('/programs');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
    click('.resultslist-actions button').then(function(){
      assert.equal(find('.newprogram').length, 1);
      click('.newprogram .cancel');
    });
  });
  andThen(function(){
    assert.equal(find('.newprogram').length, 0);
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
  });
});

test('remove program', function(assert) {
  assert.expect(3);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    owningSchool: 1,
  });
  visit('/programs');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
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

test('cancel remove program', function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    owningSchool: 1,
  });
  visit('/programs');
  andThen(function() {
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      click('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(1)').then(function(){
        click('.confirm-buttons .done');
      });
    });
  });
  andThen(function(){
    assert.equal(1, find('.resultslist-list tbody tr').length);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
  });
});

test('click edit takes you to program route', function(assert) {
  assert.expect(2);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    owningSchool: 1,
  });
  visit('/programs');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      var edit = find('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(0)');
      assert.equal(getElementText(edit), 'Edit');
      click(edit);
    });
  });
  andThen(function(){
    assert.equal(currentURL(), '/programs/1');
  });
});

test('click title takes you to program route', function(assert) {
  assert.expect(1);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    owningSchool: 1,
  });
  visit('/programs');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(0) a');
  });
  andThen(function(){
    assert.equal(currentURL(), '/programs/1');
  });
});
