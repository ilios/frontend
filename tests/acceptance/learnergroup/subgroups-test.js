import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';

const { isEmpty, isPresent } = Ember;

var application;
var url = '/learnergroups/1';
module('Acceptance: Learner Group - Subgroups' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
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

function getCellData(row, cell) {
  return find(`.resultslist-list tbody tr:eq(${row}) td:eq(${cell})`).text().trim();
}

test('add new learnergroup', function(assert) {
  assert.expect(4);

  const expandButton = '.expand-button';
  const input = '.new-learnergroup input';
  const done = '.new-learnergroup .done';

  visit(url);
  click(expandButton);
  fillIn(input, 'A New Test Title');
  click(done);
  andThen(() => {
    assert.equal(getCellData(0, 0), 'A New Test Title', 'title is correct');
    assert.equal(getCellData(0, 1), 0, 'member count is correct');
    assert.equal(getCellData(1, 0), 'learner group 1');
    assert.equal(getCellData(2, 0), 'learner group 2');
  });
});

test('cancel adding new learnergroup', function(assert) {
  assert.expect(10);

  const expandButton = '.expand-button';
  const collapseButton = '.collapse-button';
  const cancelButton = '.new-learnergroup .cancel';
  const component = '.new-learnergroup';

  visit(url);
  click(expandButton);
  andThen(() => {
    assert.ok(isPresent(find(collapseButton)), 'collapse button is visible');
    assert.ok(isPresent(find(component)), '`new-learnergroup` component is visible');
  });
  click(cancelButton);
  andThen(() => {
    assert.ok(isPresent(find(expandButton)), 'expand button is visible');
    assert.ok(isEmpty(find(component)), '`new-learnergroup` component is not visible');
    assert.equal(getCellData(0, 0), 'learner group 1');
    assert.equal(getCellData(1, 0), 'learner group 2');
  });

  click(expandButton);
  click(collapseButton);
  andThen(() => {
    assert.ok(isPresent(find(expandButton)), 'expand button is visible');
    assert.ok(isEmpty(find(component)), '`new-learnergroup` component is not visible');
    assert.equal(getCellData(0, 0), 'learner group 1');
    assert.equal(getCellData(1, 0), 'learner group 2');
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
      click('.confirm-buttons .done').then(() => {
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
    click('.resultslist-list tbody tr:eq(0) td:eq(0) a');
  });
  andThen(function(){
    assert.equal(currentURL(), '/learnergroups/2');
  });
});
