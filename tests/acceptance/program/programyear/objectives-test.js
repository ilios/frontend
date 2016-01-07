import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1/programyears/1';
module('Acceptance: Program Year - Objectives' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school', {
      school: 1,
      programYears: [1],
      competencies: [1,2]
    });
    server.create('program', {
      school: 1,
      programYears: [1]
    });
    server.create('programYear', {
      program: 1,
      competencies: [2,3],
      objectives: [1,2]
    });
    server.create('competency', {
      school: 1,
      children: [2,3]
    });
    server.create('competency', {
      parent: 1,
      school: 1,
      programYears: [1],
      objectives: [1]
    });
    server.create('competency', {
      parent: 1,
      school: 1,
      programYears: [1],
    });
    server.createList('meshDescriptor', 2, {
      objectives: [1]
    });
    server.createList('meshDescriptor', 2);

    server.create('objective', {
      programYears: [1],
      competency: 2,
      meshDescriptors: [1,2]
    });
    server.create('objective', {
      programYears: [1]
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list', function(assert) {
  visit(url);
  andThen(function() {
    let objectiveRows = find('.programyear-objective-list tbody tr');
    assert.equal(objectiveRows.length, 2);
    assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(0))), getText('objective 0'));
    assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(0))), getText('competency 1 (competency 0)'));
    assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(0))), getText('descriptor 0 descriptor 1'));

    assert.equal(getElementText(find('td:eq(0)', objectiveRows.eq(1))), getText('objective 1'));
    assert.equal(getElementText(find('td:eq(1)', objectiveRows.eq(1))), getText('Add New'));
    assert.equal(getElementText(find('td:eq(2)', objectiveRows.eq(1))), getText('Add New'));
  });
});

test('manage terms', function(assert) {
  assert.expect(21);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) a', detailObjectives).then(function(){
      assert.equal(getElementText(find('.detail-specific-title', detailObjectives)), 'SelectMeSHDescriptorsforObjective');
    });

    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, 2);
      assert.equal(getElementText(find('.content .descriptor-name', removableItems.eq(0)).eq(0)), getText('descriptor 0'));
      assert.equal(getElementText(find('.content .descriptor-name', removableItems.eq(1)).eq(0)), getText('descriptor 1'));

      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        assert.equal(searchResults.length, 4);

        assert.equal(getElementText(find('.descriptor-name', searchResults[0]).eq(0)), getText('descriptor 0'));
        assert.equal(getElementText(find('.descriptor-name', searchResults[1]).eq(0)), getText('descriptor 1'));
        assert.equal(getElementText(find('.descriptor-name', searchResults[2]).eq(0)), getText('descriptor 2'));
        assert.equal(getElementText(find('.descriptor-name', searchResults[3]).eq(0)), getText('descriptor 3'));
        assert.ok($(searchResults[0]).hasClass('disabled'));
        assert.ok($(searchResults[1]).hasClass('disabled'));
        assert.ok(!$(searchResults[2]).hasClass('disabled'));
        assert.ok(!$(searchResults[3]).hasClass('disabled'));
        click('.removable-list li:eq(0)', meshManager).then(function(){
          assert.ok(!$(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[2]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(1)', meshManager)).hasClass('disabled'));
          assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'));

          removableItems = find('.removable-list li', meshManager);
          assert.equal(removableItems.length, 2);
          assert.equal(
            getElementText(find('.content .descriptor-name', removableItems.eq(0)).eq(0)),
            getText('descriptor 1')
          );
          assert.equal(
            getElementText(find('.content .descriptor-name', removableItems.eq(1)).eq(0)),
            getText('descriptor 2')
          );
        });
      });
    });
  });
});

test('save terms', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) a', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click('button.bigadd', detailObjectives);
        andThen(function(){
          let tds = find('.programyear-objective-list tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(2)), getText('descriptor 1 descriptor 2'));
        });
      });
    });
  });
});

test('cancel term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let detailObjectives = find('.detail-objectives').eq(0);
    click('.programyear-objective-list tbody tr:eq(0) td:eq(2) a', detailObjectives);
    andThen(function() {
      let meshManager = find('.mesh-manager', detailObjectives).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click(searchResults[3]);
        click('button.bigcancel', detailObjectives);
        andThen(function(){
          let tds = find('.programyear-objective-list tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(2)), getText('descriptor 0 descriptor 1'));
        });
      });
    });
  });
});

test('manage competencies', function(assert) {
  assert.expect(10);
  visit(url);
  andThen(function() {
    let tds = find('.programyear-objective-list tbody tr:eq(0) td');
    assert.equal(tds.length, 3);
    click('a', tds.eq(1));
    andThen(function() {
      assert.equal(getElementText(find('.detail-specific-title')), 'SelectObjectiveCompetency');
      let objectiveManager = find('.objective-manage-competency').eq(0);
      assert.equal(getElementText(find('.objectivetitle', objectiveManager)), getText('objective 0'));
      assert.equal(getElementText(find('.parent-picker', objectiveManager)), getText('competency0 competency1 competency2'));
      let items = find('.parent-picker li.clickable');
      assert.equal(items.length, 2);
      assert.ok(find('.parent-picker h5').hasClass('selected'));
      assert.ok($(items[0]).hasClass('selected'));
      assert.ok(!$(items[1]).hasClass('selected'));

      andThen(function(){
        click('.parent-picker li:eq(1)', objectiveManager).then(function(){
          let items = find('.parent-picker li.clickable');
          assert.ok(!$(items[0]).hasClass('selected'));
          assert.ok($(items[1]).hasClass('selected'));
        });
      });
    });
  });
});

test('save competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker li:eq(1)', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 2 (competency 0)'));
      });
    });
  });
});

test('save no competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker li:eq(0)', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('Add New'));
      });
    });
  });
});

test('cancel competency change', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker li:eq(1)', objectiveManager).then(function(){
        click('.detail-objectives button.bigcancel');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1 (competency 0)'));
      });
    });
  });
});

test('cancel remove competency change', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(0) td:eq(1) a');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker li:eq(0)', objectiveManager).then(function(){
        click('.detail-objectives button.bigcancel');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr td:eq(1)')), getText('competency 1 (competency 0)'));
      });
    });
  });
});

test('add competency', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    click('.programyear-objective-list tbody tr:eq(1) td:eq(1) button');
    andThen(function() {
      let objectiveManager = find('.objective-manage-competency').eq(0);
      click('.parent-picker li:eq(1)', objectiveManager).then(function(){
        click('.detail-objectives button.bigadd');
      });
      andThen(function(){
          assert.equal(getElementText(find('.programyear-objective-list tbody tr:eq(1) td:eq(1)')), getText('competency 2 (competency 0)'));
      });
    });
  });
});
