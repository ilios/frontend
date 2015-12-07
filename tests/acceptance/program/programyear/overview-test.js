import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';

var application;
var url = '/programs/1/programyears/1';
module('Acceptance: Program Year - Overview' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
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
    assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
    assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
    assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));
  });
});

test('search directors', function(assert) {
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    var container = find('.programyear-overview').eq(0);
    fillIn(find('.search-box input', container), 'guy').then(function(){
      var searchResults = find('.results li', container);
      assert.equal(searchResults.length, 6);
      assert.equal(getElementText(searchResults.eq(0)), getText('0 guy M. Mc0son'));
      assert.ok(searchResults.eq(0).hasClass('active'));
      assert.equal(getElementText(searchResults.eq(1)), getText('1 guy M. Mc1son'));
      assert.ok(searchResults.eq(1).hasClass('inactive'));
      assert.equal(getElementText(searchResults.eq(2)), getText('2 guy M. Mc2son'));
      assert.ok(searchResults.eq(2).hasClass('inactive'));
      assert.equal(getElementText(searchResults.eq(3)), getText('3 guy M. Mc3son'));
      assert.ok(searchResults.eq(3).hasClass('inactive'));
      assert.equal(getElementText(searchResults.eq(4)), getText('4 guy M. Mc4son'));
      assert.ok(searchResults.eq(4).hasClass('active'));
      assert.equal(getElementText(searchResults.eq(5)), getText('5 guy M. Mc5son'));
      assert.ok(searchResults.eq(5).hasClass('active'));
    });
  });
});

test('add director', function(assert) {
  visit(url);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    var container = find('.programyear-overview').eq(0);
    var items = find('.removable-list li', container);
    assert.equal(items.length, 3);
    assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
    assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
    assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));

    fillIn(find('.search-box input', container), 'guy').then(function(){
      click('.results li:eq(5)', container).then(function(){
        var items = find('.removable-list li', container);
        assert.equal(items.length, 4);
        assert.equal(getElementText(items.eq(0)), getText('1 guy M. Mc1son'));
        assert.equal(getElementText(items.eq(1)), getText('2 guy M. Mc2son'));
        assert.equal(getElementText(items.eq(2)), getText('3 guy M. Mc3son'));
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
