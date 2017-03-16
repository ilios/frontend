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
    server.createList('user', 3, {
      directedProgramYears: [1]
    });
    server.createList('user', 2);
    server.create('program', {
      programYears: [1]
    });
    server.create('programYear', {
      program: 1,
      directors: [2,3,4]
    });
    server.create('cohort');
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list directors', function(assert) {
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    var container = find('.programyear-overview').eq(0);
    var items = find('.removable-list li', container);
    assert.equal(items.length, 3);
    assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
    assert.equal(getElementText(items.eq(1)), getText('3 guy M. Mc3son'));
    assert.equal(getElementText(items.eq(2)), getText('4 guy M. Mc4son'));
  });
});

test('search directors', function(assert) {
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    var container = find('.programyear-overview').eq(0);
    fillIn(find('.search-box input', container), 'guy').then(function(){
      var searchResults = find('.results li', container);	  
      assert.equal(searchResults.length, 7, 'results length');
      assert.equal(getElementText(searchResults.eq(0)), getText('6 Results'), 'number or results display');
      assert.equal(getElementText(searchResults.eq(1)), getText('0 guy M. Mc0son'));
      assert.ok(searchResults.eq(1).hasClass('active'));
      assert.equal(getElementText(searchResults.eq(2)), getText('1 guy M. Mc1son'));
      assert.ok(searchResults.eq(2).hasClass('active'));
      assert.equal(getElementText(searchResults.eq(3)), getText('2 guy M. Mc2son'));
      assert.ok(searchResults.eq(3).hasClass('inactive'));
      assert.equal(getElementText(searchResults.eq(4)), getText('3 guy M. Mc3son'));
      assert.ok(searchResults.eq(4).hasClass('inactive'));
      assert.equal(getElementText(searchResults.eq(5)), getText('4 guy M. Mc4son'));
      assert.ok(searchResults.eq(5).hasClass('inactive'));
      assert.equal(getElementText(searchResults.eq(6)), getText('5 guy M. Mc5son'));
      assert.ok(searchResults.eq(6).hasClass('active'));
    });
  });
});

test('add director', function(assert) {
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    let container = find('.programyear-overview').eq(0);
    let items = find('.removable-list li', container);
    assert.equal(items.length, 3);
    assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
    assert.equal(getElementText(items.eq(1)), getText('3 guy M. Mc3son'));
    assert.equal(getElementText(items.eq(2)), getText('4 guy M. Mc4son'));

    fillIn(find('.search-box input', container), 'guy').then(function(){
      click('.results li:eq(6)', container).then(function(){
        items = find('.removable-list li', container);
        assert.equal(items.length, 4);
        assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
        assert.equal(getElementText(items.eq(1)), getText('3 guy M. Mc3son'));
        assert.equal(getElementText(items.eq(2)), getText('4 guy M. Mc4son'));
        assert.equal(getElementText(items.eq(3)), getText('5 guy M. Mc5son'));
      });

    });
  });
});

test('remove director', function(assert) {
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    var container = find('.programyear-overview').eq(0);
    click('.removable-list li:eq(0)', container).then(function(){
      var items = find('.removable-list li', container);
      assert.equal(items.length, 2);
      assert.equal(getElementText(items.eq(0)), getText('2 guy M. Mc2son'));
      assert.equal(getElementText(items.eq(1)), getText('3 guy M. Mc3son'));
    });
  });
});

test('first director added is disabled #2770', async function(assert) {
  assert.expect(5);
  server.create('programYear', {
    program: 1,
    directors: []
  });
  server.create('cohort');
  server.db.programs.update(1, {programYears: [1, 2]});
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
