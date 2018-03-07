import { click, fillIn, find, findAll, currentURL, currentPath, visit } from '@ember/test-helpers';
import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Instructor Groups', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application, false);
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('visiting /instructorgroups', async function(assert) {
    server.create('user', {id: 4136});
    server.create('school');
    await visit('/instructorgroups');
    assert.equal(currentPath(), 'instructorGroups');
  });

  test('list groups', async function(assert) {
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.createList('user', 5);
    server.createList('course', 2, {schoolId: 1});
    server.create('session', {
      courseId: 1,
    });
    server.create('session', {
      courseId: 2,
    });
    let firstInstructorgroup = server.create('instructorGroup', {
      schoolId: 1,
      userIds: [2, 3, 4, 5, 6]
    });
    let secondInstructorgroup = server.create('instructorGroup', {
      schoolId: 1
    });
    server.create('offering', {
      instructorGroupIds: [1],
      sessionId: 1
    });
    server.create('offering', {
      instructorGroupIds: [1],
      sessionId: 2
    });

    assert.expect(7);
    await visit('/instructorgroups');
    assert.equal(2, findAll('.list tbody tr').length);
    var rows = find('.list tbody tr');
    assert.equal(getElementText(find(find('td'), rows.eq(0))),getText(firstInstructorgroup.title));
    assert.equal(getElementText(find(findAll('td')[1], rows.eq(0))), 5);
    assert.equal(getElementText(find(findAll('td')[2], rows.eq(0))), 2);

    assert.equal(getElementText(find(find('td'), rows.eq(1))),getText(secondInstructorgroup.title));
    assert.equal(getElementText(find(findAll('td')[1], rows.eq(1))), 0);
    assert.equal(getElementText(find(findAll('td')[2], rows.eq(1))), 0);
  });

  test('filters by title', async function(assert) {
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.create('school');
    let firstInstructorgroup = server.create('instructorGroup', {
      title: 'specialfirstinstructorgroup',
      schoolId: 1,
    });
    let secondInstructorgroup = server.create('instructorGroup', {
      title: 'specialsecondinstructorgroup',
      schoolId: 1
    });
    let regularInstructorgroup = server.create('instructorGroup', {
      title: 'regularinstructorgroup',
      schoolId: 1
    });
    let regexInstructorgroup = server.create('instructorGroup', {
      title: '\\yoo hoo',
      schoolId: 1
    });
    assert.expect(19);
    await visit('/instructorgroups');
    assert.equal(4, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regexInstructorgroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(regularInstructorgroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(2) td'))),getText(firstInstructorgroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(3) td'))),getText(secondInstructorgroup.title));

    await fillIn('.titlefilter input', 'first');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))), getText(firstInstructorgroup.title));

    await fillIn('.titlefilter input', 'second');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))), getText(secondInstructorgroup.title));

    await fillIn('.titlefilter input', 'special');
    assert.equal(2, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(firstInstructorgroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(secondInstructorgroup.title));

    await fillIn('.titlefilter input', '\\');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regexInstructorgroup.title));

    await fillIn('.titlefilter input', '');
    assert.equal(4, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText(regexInstructorgroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(1) td'))),getText(regularInstructorgroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(2) td'))),getText(firstInstructorgroup.title));
    assert.equal(getElementText(find(find('.list tbody tr:eq(3) td'))),getText(secondInstructorgroup.title));
  });

  test('filters options', async function(assert) {
    assert.expect(4);
    server.createList('school', 2);
    server.create('permission', {
      tableName: 'school',
      tableRowId: 1
    });
    server.create('user', { id: 4136, permissionIds: [1], schoolId: 2 });


    const schoolSelect = '.schoolsfilter select';
    const schools = `${schoolSelect} option`;

    await visit('/instructorgroups');
    let schoolOptions = find(schools);
    assert.equal(schoolOptions.length, 2);
    assert.equal(getElementText(schoolOptions.eq(0)), 'school0');
    assert.equal(getElementText(schoolOptions.eq(1)), 'school1');
    assert.equal(find(schoolSelect).value, '2');
  });

  test('add new instructorgroup', async function(assert) {
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    assert.expect(1);
    await visit('/instructorgroups');
    let newTitle = 'new test tile';
    await click('.actions button');
    await fillIn('.newinstructorgroup-title input', newTitle);
    await click('.new-instructorgroup .done');
    assert.equal(getElementText(find('.saved-result')), getText(newTitle + 'Saved Successfully'));
  });

  test('cancel adding new instructorgroup', async function(assert) {
    assert.expect(6);
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.create('instructorGroup', {
      schoolId: 1,
    });
    await visit('/instructorgroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('instructorgroup 0'));
    await click('.actions button');
    assert.equal(findAll('.new-instructorgroup').length, 1);
    await click('.new-instructorgroup .cancel');
    assert.equal(findAll('.new-instructorgroup').length, 0);
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('instructorgroup 0'));
  });

  test('remove instructorgroup', async function(assert) {
    assert.expect(3);
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.create('instructorGroup', {
      schoolId: 1,
    });
    await visit('/instructorgroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('instructorgroup 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    await click('.confirm-buttons .remove');
    assert.equal(0, findAll('.list tbody tr').length);
  });

  test('cancel remove instructorgroup', async function(assert) {
    assert.expect(4);
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.create('instructorGroup', {
      schoolId: 1,
    });
    await visit('/instructorgroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('instructorgroup 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    await click('.confirm-buttons .done');
    assert.equal(findAll('.list tbody tr').length, 1);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('instructorgroup 0'));
  });

  test('confirmation of remove message', async function(assert) {
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.createList('user', 5);
    server.createList('course', 2, {
      schoolId: 1
    });
    server.create('session', {
      courseId: 1,
    });
    server.create('session', {
      courseId: 2,
    });
    server.create('instructorGroup', {
      schoolId: 1,
      userIds: [2, 3, 4, 5, 6],
    });
    server.create('offering', {
      instructorGroupIds: [1],
      sessionId: 1
    });
    server.create('offering', {
      instructorGroupIds: [1],
      sessionId: 2
    });

    assert.expect(5);
    await visit('/instructorgroups');
    assert.equal(1, findAll('.list tbody tr').length);
    assert.equal(getElementText(find(find('.list tbody tr:eq(0) td'))),getText('instructorgroup 0'));
    await click('.list tbody tr:eq(0) td:eq(3) .remove');
    assert.ok(find('.list tbody tr').classList.contains('confirm-removal'));
    assert.ok(find(findAll('.list tbody tr')[1]).classList.contains('confirm-removal'));
    assert.equal(getElementText(find(findAll('.list tbody tr')[1])), getText('Are you sure you want to delete this instructor group, with 5 instructors and 2 courses? This action cannot be undone. Yes Cancel'));
  });

  test('click edit takes you to instructorgroup route', async function(assert) {
    assert.expect(1);
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.create('instructorGroup', {
      schoolId: 1,
    });
    await visit('/instructorgroups');
    let edit = find('.list tbody tr:eq(0) td:eq(3) .edit');
    await click(edit);
    assert.equal(currentURL(), '/instructorgroups/1');
  });

  test('click title takes you to instructorgroup route', async function(assert) {
    assert.expect(1);
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.create('instructorGroup', {
      schoolId: 1,
    });
    await visit('/instructorgroups');
    await click('.list tbody tr:eq(0) td:eq(0) a');
    assert.equal(currentURL(), '/instructorgroups/1');
  });

  test('title filter escapes regex', async function(assert) {
    assert.expect(4);
    server.create('school');
    server.create('user', {id: 4136, schoolId: 1});
    server.create('instructorGroup', {
      title: 'yes\\no',
      schoolId: 1,
    });

    const groups = '.list tbody tr';
    const firstGroupTitle = `${groups}:eq(0) td:eq(0)`;
    const filter = '.titlefilter input';
    await visit('/instructorgroups');

    assert.equal(findAll(groups).length, 1);
    assert.equal(getElementText(firstGroupTitle), 'yes\\no');
    await fillIn(filter, '\\');
    assert.equal(findAll(groups).length, 1);
    assert.equal(getElementText(firstGroupTitle), 'yes\\no');
  });
});
