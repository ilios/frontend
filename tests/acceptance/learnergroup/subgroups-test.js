import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {b as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { isEmpty, isPresent } = Ember;

var application;
var fixtures = {};
var url = '/learnergroups/1';
module('Acceptance: Learner Group - Subgroups' + testgroup, {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);

    server.createList('user', 2, {
      learnerGroups: [2]
    });
    server.create('cohort', {
      learnerGroups: [1,2,3,4,5]
    });
    fixtures.learnerGroup1 = server.create('learnerGroup', {
      cohort: 1,
      parent: 1,
      children: [2,3],
    });
    fixtures.learnerGroup2 = server.create('learnerGroup', {
      cohort: 1,
      parent: 1,
      children: [4,5],
      users: [2,3]
    });
    fixtures.learnerGroup3 = server.create('learnerGroup', {
      cohort: 1,
      parent: 1
    });
    server.createList('learnerGroup', 2, {
      cohort: 1,
      parent: 2
    });
  },

  afterEach: function() {
    destroyApp(application);
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

test('switching between single- and multi-group mode', function(assert) {
  assert.expect(11);

  const expandButton = '.expand-button';
  const singleGroupButton = '.first-button';
  const multiGroupsButton = '.second-button';
  const activeClass = 'active';
  const container = find('.learnergroup-subgroup-list')[0];
  visit(url);
  click(expandButton);
  andThen(() => {
    assert.ok(isPresent(find(singleGroupButton, container)), 'single group button is visible');
    assert.ok(isPresent(find(multiGroupsButton, container)), 'multi-groups button is visible');
    assert.ok($(singleGroupButton, container).hasClass(activeClass), 'single group button is active by default');
    assert.ok(!$(multiGroupsButton, container).hasClass(activeClass), 'multi-groups button is not active by default');
    assert.equal(
      getElementText(find('.resultslist-new .detail-content .form-label', container)),
      getText('Title:'),
      'single group entry form is visible by default'
    );
    click(multiGroupsButton).then(() => {
      assert.ok(!$(singleGroupButton, container).hasClass(activeClass), 'single group button is not active');
      assert.ok($(multiGroupsButton, container).hasClass(activeClass), 'multi-groups button is active');
      assert.equal(
        getElementText(find('.resultslist-new .detail-content .form-label', container)),
        getText('Number of Groups:'),
        'multi-groups entry form is visible by default'
      );
      click(singleGroupButton).then(() => {
        assert.ok($(singleGroupButton, container).hasClass(activeClass), 'single group button is active, again');
        assert.ok(!$(multiGroupsButton, container).hasClass(activeClass), 'multi-groups button is not active, again');
        assert.equal(
          getElementText(find('.resultslist-new .detail-content .form-label', container)),
          getText('Title:'),
          'single group entry form is visible, again'
        );
      });
    });
  });
});

test('generate new learnergroups', function(assert) {
  assert.expect(11);

  const expandButton = '.expand-button';
  const input = '.new-learnergroup input';
  const done = '.new-learnergroup .done';
  const multiGroupsButton = '.second-button';
  const parentLearnergroupTitle = fixtures.learnerGroup1.title;

  visit(url);
  // add five subgroups
  click(expandButton);
  click(multiGroupsButton);
  fillIn(input, '5');
  click(done);
  andThen(() => {
    assert.equal(find('.resultslist-list tbody tr').length, 7, 'all subgroups are displayed.');
    for (let i = 0; i < 5; i++) {
      assert.equal(getCellData(i, 0), `${parentLearnergroupTitle} ${i + 1}`, 'new learnergroup title is ok.');
    }
    assert.equal(getCellData(5, 0), 'learner group 1');
    assert.equal(getCellData(6, 0), 'learner group 2');

    // add two more subgroups
    click(expandButton);
    click(multiGroupsButton);
    fillIn(input, '2');
    click(done);
    andThen(() => {
      assert.equal(find('.resultslist-list tbody tr').length, 9, 'all subgroups are still displayed.');
      assert.equal(getCellData(5, 0), `${parentLearnergroupTitle} 6`, 'consecutively new learnergroup title is ok.');
      assert.equal(getCellData(6, 0), `${parentLearnergroupTitle} 7`, 'consecutively new learnergroup title is ok.');
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
