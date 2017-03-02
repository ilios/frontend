import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

var application;

module('Acceptance: Programs', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
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
    assert.equal(3, find('.list tbody tr').length);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(regularProgram.title));
    assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(firstProgram.title));
    assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')),getText(secondProgram.title));

    //put these in nested later blocks because there is a 500ms debounce on the title filter
    fillIn('.titlefilter input', 'first');
    Ember.run.later(function(){
      assert.equal(1, find('.list tbody tr').length);
      assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(firstProgram.title));
      fillIn('.titlefilter input', 'second');
      andThen(function(){
        Ember.run.later(function(){
          assert.equal(1, find('.list tbody tr').length);
          assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(secondProgram.title));
          fillIn('.titlefilter input', 'special');
          andThen(function(){
            Ember.run.later(function(){
              assert.equal(2, find('.list tbody tr').length);
              assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(firstProgram.title));
              assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(secondProgram.title));

              fillIn('.titlefilter input', '');
              andThen(function(){
                Ember.run.later(function(){
                  assert.equal(3, find('.list tbody tr').length);
                  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(regularProgram.title));
                  assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(firstProgram.title));
                  assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')),getText(secondProgram.title));
                }, 750);
              });
            }, 750);
          });
        }, 750);
      });
    }, 750);
  });
});

test('filters options', function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136, permissions: [1], school: 2});
  server.createList('school', 2);
  server.create('permission', {
    tableName: 'school',
    tableRowId: 1,
    user: 4136
  });

  const schoolSelect = '.schoolsfilter select';
  const schools = `${schoolSelect} option`;

  visit('/programs');
  andThen(function() {
    let schoolOptions = find(schools);
    assert.equal(schoolOptions.length, 2);
    assert.equal(getElementText(schoolOptions.eq(0)), 'school0');
    assert.equal(getElementText(schoolOptions.eq(1)), 'school1');
    assert.equal(find(schoolSelect).val(), '2');
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
    assert.equal(1, find('.list tbody tr').length);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
    click('.list tbody tr:eq(0) td:eq(3) .remove').then(function(){
      click('.confirm-buttons .remove');
    });
  });
  andThen(function(){
    assert.equal(find('.flash-messages').length, 1);
    assert.equal(0, find('.list tbody tr').length);
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
    assert.equal(1, find('.list tbody tr').length);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
    click('.list tbody tr:eq(0) td:eq(3) .remove').then(function(){
      click('.confirm-buttons .done');
    });
  });
  andThen(function(){
    assert.equal(1, find('.list tbody tr').length);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('program 0'));
  });
});

test('click edit takes you to program route', function(assert) {
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
    var edit = find('.list tbody tr:eq(0) td:eq(3) .edit');
    click(edit);
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
    click('.list tbody tr:eq(0) td:eq(0) a');
  });
  andThen(function(){
    assert.equal(currentURL(), '/programs/1');
  });
});

test('title filter escapes regex', async function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    programs: [1]
  });
  server.create('program', {
    title: 'yes\\no',
    school: 1,
  });

  const programs = '.list tbody tr';
  const firstProgramTitle = `${programs}:eq(0) td:eq(0)`;
  const filter = '.titlefilter input';
  await visit('/programs');

  assert.equal(find(programs).length, 1);
  assert.equal(getElementText(firstProgramTitle), 'yes\\no');
  await fillIn(filter, '\\');
  assert.equal(find(programs).length, 1);
  assert.equal(getElementText(firstProgramTitle), 'yes\\no');
});
