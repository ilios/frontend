import { test } from 'qunit';
import moduleForAcceptance from 'ilios/tests/helpers/module-for-acceptance';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;

moduleForAcceptance('Acceptance: Learnergroup', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
  },

  afterEach: function() {
    destroyApp(application);
  }
});


test('generate new subgroups', function(assert) {
  server.create('cohort', {
    learnerGroups: [1, 2, 3]
  });
  server.create('programYear');
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
  server.createList('user', 2, {
    learnerGroups: [2]
  });

  assert.expect(11);

  const subgroupList = '.learnergroup-subgroup-list';
  const expandButton = `${subgroupList} .expand-button`;
  const input = `${subgroupList} .new-learnergroup input`;
  const done = `${subgroupList} .new-learnergroup .done`;
  const multiGroupsButton = `${subgroupList} .second-button`;
  const parentLearnergroupTitle = `learner group 0`;
  const table = `${subgroupList} .learnergroup-subgroup-list-list table tbody`;

  visit('/learnergroups/1');
  // add five subgroups
  click(expandButton);
  click(multiGroupsButton);
  fillIn(input, '5');
  click(done);
  function getCellData(row, cell) {
    return find(`${table} tr:eq(${row}) td:eq(${cell})`).text().trim();
  }
  andThen(() => {
    assert.equal(find(`${table} tr`).length, 7, 'all subgroups are displayed.');
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
      assert.equal(find(`${table} tr`).length, 9, 'all subgroups are still displayed.');
      assert.equal(getCellData(5, 0), `${parentLearnergroupTitle} 6`, 'consecutively new learnergroup title is ok.');
      assert.equal(getCellData(6, 0), `${parentLearnergroupTitle} 7`, 'consecutively new learnergroup title is ok.');
    });
  });
});
