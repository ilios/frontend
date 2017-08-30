import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import Ember from 'ember';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import wait from 'ember-test-helpers/wait';

var application;

module('Acceptance: Instructor Groups', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, false);
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('visiting /instructorgroups', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  await visit('/instructorgroups');
  assert.equal(currentPath(), 'instructorGroups');
});

test('list groups', async function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    instructorGroups: [1]
  });
  server.create('course', {
    sessions: [1]
  });
  server.create('course', {
    sessions: [2]
  });
  server.create('session', {
    course: 1,
    offerings: [1]
  });
  server.create('session', {
    course: 2,
    offerings: [2]
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 1
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 2
  });
  server.create('school', {
    instructorGroups: [1,2]
  });
  var firstInstructorgroup = server.create('instructorGroup', {
    school: 1,
    users: [2,3,4,5,6],
    offerings: [1,2]
  });
  var secondInstructorgroup = server.create('instructorGroup', {
    school: 1
  });
  assert.expect(7);
  await visit('/instructorgroups');
  assert.equal(2, find('.list tbody tr').length);
  var rows = find('.list tbody tr');
  assert.equal(getElementText(find('td:eq(0)', rows.eq(0))),getText(firstInstructorgroup.title));
  assert.equal(getElementText(find('td:eq(1)', rows.eq(0))), 5);
  assert.equal(getElementText(find('td:eq(2)', rows.eq(0))), 2);

  assert.equal(getElementText(find('td:eq(0)', rows.eq(1))),getText(secondInstructorgroup.title));
  assert.equal(getElementText(find('td:eq(1)', rows.eq(1))), 0);
  assert.equal(getElementText(find('td:eq(2)', rows.eq(1))), 0);
});

test('filters by title', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1,2,3]
  });
  let firstInstructorgroup = server.create('instructorGroup', {
    title: 'specialfirstinstructorgroup',
    school: 1,
  });
  let secondInstructorgroup = server.create('instructorGroup', {
    title: 'specialsecondinstructorgroup',
    school: 1
  });
  let regularInstructorgroup = server.create('instructorGroup', {
    title: 'regularinstructorgroup',
    school: 1
  });
  assert.expect(15);
  await visit('/instructorgroups');
  assert.equal(3, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(regularInstructorgroup.title));
  assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(firstInstructorgroup.title));
  assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')),getText(secondInstructorgroup.title));

  //put these in nested later blocks because there is a 500ms debounce on the title filter
  await fillIn('.titlefilter input', 'first');
  Ember.run.later(async () =>{
    assert.equal(1, find('.list tbody tr').length);
    assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(firstInstructorgroup.title));
    await fillIn('.titlefilter input', 'second');
    Ember.run.later(async () =>{
      assert.equal(1, find('.list tbody tr').length);
      assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(secondInstructorgroup.title));
      await fillIn('.titlefilter input', 'special');
      Ember.run.later(async () =>{
        assert.equal(2, find('.list tbody tr').length);
        assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(firstInstructorgroup.title));
        assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(secondInstructorgroup.title));

        await fillIn('.titlefilter input', '');
        Ember.run.later(async () =>{
          assert.equal(3, find('.list tbody tr').length);
          assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText(regularInstructorgroup.title));
          assert.equal(getElementText(find('.list tbody tr:eq(1) td:eq(0)')),getText(firstInstructorgroup.title));
          assert.equal(getElementText(find('.list tbody tr:eq(2) td:eq(0)')),getText(secondInstructorgroup.title));
        }, 750);
      }, 750);
    }, 750);
  }, 750);

  await wait();
});

test('filters options', async function(assert) {
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

  await visit('/instructorgroups');
  let schoolOptions = find(schools);
  assert.equal(schoolOptions.length, 2);
  assert.equal(getElementText(schoolOptions.eq(0)), 'school0');
  assert.equal(getElementText(schoolOptions.eq(1)), 'school1');
  assert.equal(find(schoolSelect).val(), '2');
});

test('add new instructorgroup', async function(assert) {
  server.create('user', {id: 4136});
  server.create('school');
  assert.expect(1);
  await visit('/instructorgroups');
  let newTitle = 'new test tile';
  await click('.actions button');
  await fillIn('.newinstructorgroup-title input', newTitle);
  await click('.newinstructorgroup .done');
  assert.equal(getElementText(find('.saved-result')), getText(newTitle + 'Saved Successfully'));
});

test('cancel adding new instructorgroup', async function(assert) {
  assert.expect(6);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  await visit('/instructorgroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
  await click('.actions button');
  assert.equal(find('.newinstructorgroup').length, 1);
  await click('.newinstructorgroup .cancel');
  assert.equal(find('.newinstructorgroup').length, 0);
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
});

test('remove instructorgroup', async function(assert) {
  assert.expect(3);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  await visit('/instructorgroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
  await click('.list tbody tr:eq(0) td:eq(3) .remove');
  await click('.confirm-buttons .remove');
  assert.equal(0, find('.list tbody tr').length);
});

test('cancel remove instructorgroup', async function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  await visit('/instructorgroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
  await click('.list tbody tr:eq(0) td:eq(3) .remove');
  await click('.confirm-buttons .done');
  assert.equal(find('.list tbody tr').length, 1);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
});

test('confirmation of remove message', async function(assert) {
  server.create('user', {id: 4136});
  server.createList('user', 5, {
    instructorGroups: [1]
  });
  server.create('course', {
    sessions: [1]
  });
  server.create('course', {
    sessions: [2]
  });
  server.create('session', {
    course: 1,
    offerings: [1]
  });
  server.create('session', {
    course: 2,
    offerings: [2]
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 1
  });
  server.create('offering', {
    instructorGroups: [1],
    session: 2
  });
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
    users: [2,3,4,5,6],
    offerings: [1,2]
  });
  assert.expect(5);
  await visit('/instructorgroups');
  assert.equal(1, find('.list tbody tr').length);
  assert.equal(getElementText(find('.list tbody tr:eq(0) td:eq(0)')),getText('instructorgroup 0'));
  await click('.list tbody tr:eq(0) td:eq(3) .remove');
  assert.ok(find('.list tbody tr:eq(0)').hasClass('confirm-removal'));
  assert.ok(find('.list tbody tr:eq(1)').hasClass('confirm-removal'));
  assert.equal(getElementText(find('.list tbody tr:eq(1)')), getText('Are you sure you want to delete this instructor group, with 5 instructors and 2 courses? This action cannot be undone. Yes Cancel'));
});

test('click edit takes you to instructorgroup route', async function(assert) {
  assert.expect(1);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  await visit('/instructorgroups');
  let edit = find('.list tbody tr:eq(0) td:eq(3) .edit');
  await click(edit);
  assert.equal(currentURL(), '/instructorgroups/1');
});

test('click title takes you to instructorgroup route', async function(assert) {
  assert.expect(1);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    school: 1,
  });
  await visit('/instructorgroups');
  await click('.list tbody tr:eq(0) td:eq(0) a');
  assert.equal(currentURL(), '/instructorgroups/1');
});

test('title filter escapes regex', async function(assert) {
  assert.expect(4);
  server.create('user', {id: 4136});
  server.create('school', {
    instructorGroups: [1]
  });
  server.create('instructorGroup', {
    title: 'yes\\no',
    school: 1,
  });

  const groups = '.list tbody tr';
  const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
  const filter = '.titlefilter input';
  await visit('/instructorgroups');

  assert.equal(find(groups).length, 1);
  assert.equal(getElementText(firstGroupTitle), 'yes\\no');
  await fillIn(filter, '\\');
  assert.equal(find(groups).length, 1);
  assert.equal(getElementText(firstGroupTitle), 'yes\\no');
});
