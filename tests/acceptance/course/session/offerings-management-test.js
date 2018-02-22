import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

let application;

module('Acceptance: Session - Offering Management', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('search for instructor who is a course director #2838', async function(assert) {
    assert.expect(1);

    const school = server.create('school');
    const permission1 = server.create('permission', {
      tableRowId: '1',
      tableName: 'school'
    });
    const users = server.createList('user', 3, {
      school,
      permissions: [permission1],
    });
    const course = server.create('course', {
      school,
      directors: [users[0], users[1], users[2]],
    });
    const session = server.create('session', {
      course,
    });
    server.create('offering', {
      session,
    });


    const editButton = '.offering-detail-box .edit';
    const form = '.offering-form';
    const search = `${form} .search-box`;
    const searchBox = `${search} input`;
    const results = `${form} .results li`;

    await visit('/courses/1/sessions/1');
    await click(editButton);
    await fillIn(searchBox, 'guy 3');
    assert.equal(find(results).length, 2);
  });

  test('searching for course directors as instructors does not remove existing instructors #3479', async function(assert) {
    assert.expect(7);

    const school = server.create('school');
    const permission1 = server.create('permission', {
      tableRowId: '1',
      tableName: 'school'
    });
    const users = server.createList('user', 3, {
      school,
      permissions: [permission1],
    });
    const course = server.create('course', {
      school,
      directors: [users[0], users[1]],
    });
    const session = server.create('session', {
      course,
    });
    server.create('offering', {
      session
    });


    const editButton = '.offering-detail-box .edit';
    const form = '.offering-form';
    const instructors = `${form} .instructors`;
    const search = `${instructors} .search-box`;
    const searchBox = `${search} input`;
    const results = `${instructors} .results li`;
    const firstResult = `${results}:eq(1)`;
    const selectedInstructors = `${instructors} .tag-list li`;
    const firstSelectedInstructor = `${selectedInstructors}:eq(0)`;
    const secondSelectedInstructor = `${selectedInstructors}:eq(1)`;

    await visit('/courses/1/sessions/1');
    await click(editButton);
    await fillIn(searchBox, 'guy 2');
    assert.equal(find(results).length, 2);
    await click(firstResult);
    assert.equal(find(selectedInstructors).length, 1);
    assert.equal(find(firstSelectedInstructor).text().trim(), '2 guy M. Mc2son');
    await fillIn(searchBox, 'guy 3');
    assert.equal(find(selectedInstructors).length, 1);
    assert.equal(find(firstSelectedInstructor).text().trim(), '2 guy M. Mc2son');
    await click(firstResult);
    assert.equal(find(selectedInstructors).length, 2);
    assert.equal(find(secondSelectedInstructor).text().trim(), '3 guy M. Mc3son');
  });
});