import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1/programyears/1';
module('Acceptance: Program Year - Overview', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.createList('user', 5);
    server.create('program', {
      schoolId: 1
    });
    server.create('programYear', {
      programId: 1,
      directorIds: [2, 3, 4]
    });
    server.create('cohort', {
      programYearId: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list directors', async function(assert) {
  await visit(url);

  assert.equal(currentPath(), 'program.programYear.index');
  var container = find('.programyear-overview').eq(0);
  var items = find('.removable-list li', container);
  assert.equal(items.length, 3);
  assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
  assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
  assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));
});

test('search directors', async function(assert) {
  await visit(url);

  assert.equal(currentPath(), 'program.programYear.index');
  var container = find('.programyear-overview').eq(0);
  fillIn(find('.search-box input', container), 'guy').then(function(){
    var searchResults = find('.results li', container);
    assert.equal(searchResults.length, 7);
    assert.equal(getElementText(searchResults.eq(0)), getText('6 Results'));
    assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son user@example.edu'));
    assert.ok(searchResults.eq(1).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(2)), getText('1 guy M. Mc1son user@example.edu'));
    assert.ok(searchResults.eq(2).hasClass('inactive'));
    assert.equal(getElementText(searchResults.eq(3)), getText('2 guy M. Mc2son user@example.edu'));
    assert.ok(searchResults.eq(3).hasClass('inactive'));
    assert.equal(getElementText(searchResults.eq(4)), getText('3 guy M. Mc3son user@example.edu'));
    assert.ok(searchResults.eq(4).hasClass('inactive'));
    assert.equal(getElementText(searchResults.eq(5)), getText('4 guy M. Mc4son user@example.edu'));
    assert.ok(searchResults.eq(5).hasClass('active'));
    assert.equal(getElementText(searchResults.eq(6)), getText('5 guy M. Mc5son user@example.edu'));
    assert.ok(searchResults.eq(6).hasClass('active'));
  });
});

test('add director', async function(assert) {
  await visit(url);

  assert.equal(currentPath(), 'program.programYear.index');
  let container = find('.programyear-overview').eq(0);
  let items = find('.removable-list li', container);
  assert.equal(items.length, 3);
  assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
  assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
  assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));

  await fillIn(find('.search-box input', container), 'guy');
  await click('.results li:eq(6)', container);
  items = find('.removable-list li', container);
  assert.equal(items.length, 4);
  assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
  assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
  assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));
  assert.equal(getElementText(items.eq(3)), getText('5 guy M. Mc5son'));
});

test('remove director', async function(assert) {
  await visit(url);

  assert.equal(currentPath(), 'program.programYear.index');
  var container = find('.programyear-overview').eq(0);
  await click('.removable-list li:eq(0)', container);
  var items = find('.removable-list li', container);
  assert.equal(items.length, 2);
  assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
  assert.equal(getElementText(items.eq(1)), getText('3 guy M. Mc3son'));
});

test('first director added is disabled #2770', async function(assert) {
  assert.expect(5);
  server.create('programYear', {
    programId: 1,
    directorIds: []
  });
  server.create('cohort', {
    programYearId: 2
  });
  const overview = '.programyear-overview';
  const directors = `${overview} .removable-list li`;
  const search = `${overview} .live-search`;
  const input = `${search} input`;
  const results = `${search} .results li`;
  const firstResult = `${results}:eq(1)`;

  await visit('/programs/1/programyears/2');

  assert.equal(currentPath(), 'program.programYear.index');
  assert.equal(find(directors).length, 0, 'no directors initially');
  await fillIn(input, 'guy');
  assert.notOk(find(firstResult).hasClass('inactive'), 'the first user is active now');
  await click(firstResult);
  assert.equal(find(directors).length, 1, 'director is selected');
  assert.ok(find(firstResult).hasClass('inactive'), 'the first user is now marked as inactive');

});
