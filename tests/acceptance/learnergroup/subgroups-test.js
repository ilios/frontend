/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

var application;
var fixtures = {};
var url = '/learnergroup/1';
module('Acceptance: Learner Group - Subgroups', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});

    server.createList('user', 2, {
      learnerGroups: [2]
    });
    server.create('cohort', {
      learnerGroups: [1,2,3,4,5]
    });
    server.create('learnerGroup', {
      cohort: 1,
      parent: 1,
      children: [2,3],
    });
    server.create('learnerGroup', {
      cohort: 1,
      parent: 1,
      children: [4,5],
      users: [2,3]
    });
    server.create('learnerGroup', {
      cohort: 1,
      parent: 1
    });
    server.createList('learnerGroup', 2, {
      cohort: 1,
      parent: 2
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list groups', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    assert.equal(2, find('.resultslist-list tbody tr', container).length);
    var rows = find('.resultslist-list tbody tr');
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))),getText('learner group 1'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), 2);

    assert.equal(getElementText(find('td:eq(0)', rows.eq(1))),getText('learner group 2'));
    assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), 0);
  });
});

test('add new learnergroup', function(assert) {
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    click('.add', container);
    fillIn('.newlearnergroup input', 'a new test title');
    click('.newlearnergroup .done');
  });

  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    assert.equal(3, find('.resultslist-list tbody tr', container).length);
    var rows = find('.resultslist-list tbody tr', container);
    assert.equal(getElementText(find('td:eq(0)', rows.eq(0))),getText('a new test title'));
    assert.equal(getElementText(find('td:eq(0)', rows.eq(1))),getText('learner group 1'));
    assert.equal(getElementText(find('td:eq(0)', rows.eq(2))),getText('learner group 2'));
  });
});

test('cancel adding new learnergroup', function(assert) {
  assert.expect(8);
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    assert.equal(find('.resultslist-list tbody tr', container).length, 2);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)', container)),getText('learnergroup 1'));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)', container)),getText('learnergroup 2'));
    click('.add', container).then(function(){
      assert.equal(find('.newlearnergroup').length, 1);
      click('.newlearnergroup .cancel');
    });
    andThen(function(){
      assert.equal(find('.newlearnergroup').length, 0);
      assert.equal(find('.resultslist-list tbody tr', container).length, 2);
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)', container)),getText('learnergroup 1'));
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)', container)),getText('learnergroup 2'));
    });
  });
});


test('remove learnergroup', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    assert.equal(find('.resultslist-list tbody tr', container).length, 2);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)', container)),getText('learnergroup 1'));
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)', container)),getText('learnergroup 2'));
    click('.resultslist-list tbody tr:eq(0) td:eq(2) span', container).then(function(){
      click('.confirm-buttons .remove', container).then(() => {
        assert.equal(find('.resultslist-list tbody tr').length, 1);
        assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)', container)),getText('learnergroup 2'));
      });
    });
  });
});

test('cancel remove learnergroup', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    assert.equal(find('.resultslist-list tbody tr', container).length, 2);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)', container)),getText('learnergroup 1'));
    click('.resultslist-list tbody tr:eq(0) td:eq(2) span').then(function(){
      click('.confirm-buttons .cancel').then(() => {
          assert.equal(find('.resultslist-list tbody tr').length, 2);
          assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)', container)),getText('learnergroup 1'));
          assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1) td:eq(0)', container)),getText('learnergroup 2'));
      });
    });
  });
});

test('confirmation of remove message', function(assert) {
  assert.expect(5);
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    assert.equal(find('.resultslist-list tbody tr', container).length, 2);
    assert.equal(getElementText(find('.resultslist-list tbody tr:eq(0) td:eq(0)', container)),getText('learnergroup 1'));
    click('.resultslist-list tbody tr:eq(0) td:eq(2) span', container).then(function(){
      assert.ok(find('.resultslist-list tbody tr:eq(0)', container).hasClass('confirm-removal'));
      assert.ok(find('.resultslist-list tbody tr:eq(1)', container).hasClass('confirm-removal'));
      assert.equal(getElementText(find('.resultslist-list tbody tr:eq(1)', container)), getText('Are you sure you want to delete this learner group, with 2 learners and 2 subgroups? This action cannot be undone. Yes Cancel'));
    });
  });
});

test('click title takes you to learnergroup route', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    var container = find('.learnergroup-subgroup-list');
    click('.resultslist-list tbody tr:eq(0) td:eq(0) a');
  });
  andThen(function(){
    assert.equal(currentURL(), '/learnergroup/2');
  });
});
