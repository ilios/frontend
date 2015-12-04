import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';

var application;

module('Acceptance: Programs' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
  },

  afterEach: function() {
    destroyApp(application);
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
    school: 1,
  });
  var secondProgram = server.create('program', {
    title: 'specialsecondprogram',
    school: 1
  });
  var regularProgram = server.create('program', {
    title: 'regularprogram',
    school: 1
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
  assert.expect(3);

  server.create('user', {id: 4136});
  server.create('school');

  const url = '/programs';
  const expandButton = '.expand-button';
  const input = '.new-program input';
  const saveButton = '.new-program .done';
  const savedLink = '.saved-result a';

  visit(url);
  click(expandButton);
  fillIn(input, 'Test Title');
  click(saveButton);
  andThen(() => {
    function getContent(i) {
      return find(`tbody tr td:eq(${i})`).text().trim();
    }

    assert.equal(find(savedLink).text().trim(), 'Test Title', 'link is visisble');
    assert.equal(getContent(0), 'Test Title', 'program is correct');
    assert.equal(getContent(1), 'school 0', 'school is correct');
  });
});

test('remove program', function(assert) {
  assert.expect(3);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    school: 1,
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
    school: 1,
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
    school: 1,
  });
  visit('/programs');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(3) button').then(function(){
      var edit = find('.resultslist-list tbody tr:eq(0) td:eq(3) li:eq(0) a');
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
    school: 1,
  });
  visit('/programs');
  andThen(function() {
    click('.resultslist-list tbody tr:eq(0) td:eq(0) a');
  });
  andThen(function(){
    assert.equal(currentURL(), '/programs/1');
  });
});
