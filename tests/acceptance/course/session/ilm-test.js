import { click, fillIn, currentPath, findAll, find, visit } from '@ember/test-helpers';
import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';

module('Acceptance: Session - Independent Learning', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    fixtures.school = server.create('school');
    setupAuthentication(application, {
      id: 4136,
      schoolId: 1
    });
    server.createList('user', 6);
    server.create('academicYear');
    fixtures.course = server.create('course', {
      schoolId: 1
    });

    fixtures.instructorGroups = [];
    fixtures.instructorGroups.pushObjects(server.createList('instructorGroup', 5,{
      schoolId: 1
    }));
    fixtures.sessionType = server.create('sessionType');
    fixtures.sessionDescription = server.create('sessionDescription');
    fixtures.ilmSession = server.create('ilmSession', {
      instructorGroupIds: [1,2,3],
      instructorIds: [2,3,4]
    });
    fixtures.session = server.create('session', {
      courseId: 1,
      ilmSessionId: 1
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('initial selected instructors', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    assert.equal(getElementText(find('.title', container)), getText('Instructors(6)'));
    var selectedGroups = find('.detail-instructors-list ul:eq(0) li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
    for(let i = 0; i < fixtures.ilmSession.instructorGroups.length; i++){
      let expectedTitle = getText(fixtures.instructorGroups[fixtures.ilmSession.instructorGroupIds[i] - 1].title);
      let title = getElementText(selectedGroups.eq(i));
      assert.equal(title, expectedTitle);
    }

    var selectedUsers = find('.detail-instructors-list ul:eq(1) li', container);
    assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
    assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
  });

  test('manage instructors lists', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    var selectedGroups = find('.instructor-selection-manager ul:eq(0) li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
    assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

    var selectedUsers = find('.instructor-selection-manager ul:eq(1) li', container);
    assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
    assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
  });

  test('manage instructors search users', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    let searchBox = find('.search-box', container);
    assert.equal(searchBox.length, 1);
    searchBox = searchBox.eq(0);
    let searchBoxInput = find('input', searchBox);
    assert.equal(searchBoxInput.attr('placeholder'), 'Find Instructor or Group');
    await fillIn(searchBoxInput, 'guy');
    await click('span.search-icon', searchBox);
    let searchResults = find('[data-test-user-search] .results li', container);
    assert.equal(searchResults.length, 8);
    let expectedResults = '7 Results 0 guy M. Mc0son user@example.edu 1 guy M. Mc1son user@example.edu 2 guy M. Mc2son user@example.edu 3 guy M. Mc3son user@example.edu 4 guy M. Mc4son user@example.edu 5 guy M. Mc5son user@example.edu 6 guy M. Mc6son user@example.edu';
    assert.equal(getElementText(searchResults), getText(expectedResults));

    let activeResults = find('[data-test-user-search] .results li.active', container);
    assert.equal(getElementText(activeResults), getText('0 guy M. Mc0son user@example.edu 4 guy M. Mc4son user@example.edu 5 guy M. Mc5son user@example.edu 6 guy M. Mc6son user@example.edu'));

    let inActiveResults = find('[data-test-user-search] .results li.inactive', container);
    assert.equal(getElementText(inActiveResults), getText('1 guy M. Mc1son user@example.edu 2 guy M. Mc2son user@example.edu 3 guy M. Mc3son user@example.edu'));
  });


  test('manage instructors search groups', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    let searchBox = find('.search-box', container);
    assert.equal(searchBox.length, 1);
    searchBox = searchBox.eq(0);
    let searchBoxInput = find('input', searchBox);
    assert.equal(searchBoxInput.attr('placeholder'), 'Find Instructor or Group');
    await fillIn(searchBoxInput, 'group');
    await click('span.search-icon', searchBox);
    let searchResults = find('[data-test-user-search] .results li', container);
    assert.equal(searchResults.length, 6);
    let expectedResults = '5 Results instructorgroup 0 instructorgroup 1 instructorgroup 2 instructorgroup 3 instructorgroup 4';
    assert.equal(getElementText(searchResults), getText(expectedResults));

    let activeResults = find('[data-test-user-search] .results li.active', container);
    assert.equal(getElementText(activeResults), getText('instructorgroup 3 instructorgroup 4'));

    let inActiveResults = find('[data-test-user-search] .results li.inactive', container);
    assert.equal(getElementText(inActiveResults), getText('instructorgroup 0 instructorgroup 1 instructorgroup 2'));
  });

  test('add instructor group', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    let input = find('.search-box input', container);
    await fillIn(input, 'group');
    await click('span.search-icon', container);
    await click(findAll('[data-test-user-search] .results li')[4]);
    let selectedGroups = find('.instructor-selection-manager ul:eq(0) li', container);
    assert.equal(selectedGroups.length, 4);
    assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3'));

    let selectedUsers = find('.instructor-selection-manager ul:eq(1) li', container);
    assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
    assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
    await click('.bigadd', container);
    let groups = find('.detail-instructors-list ul:eq(0) li', container);
    assert.equal(groups.length, 4);
    assert.equal(getElementText(groups), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3'));

    let users = find('.detail-instructors-list ul:eq(1) li', container);
    assert.equal(users.length, 3);
    assert.equal(getElementText(users), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
  });

  test('add instructor', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    let input = find('.search-box input', container);
    await fillIn(input, 'guy');
    await click('span.search-icon', container);
    await click(findAll('[data-test-user-search] .results li')[5]);
    var selectedGroups = find('.instructor-selection-manager ul:eq(0) li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
    assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

    var selectedUsers = find('.instructor-selection-manager ul:eq(1) li', container);
    assert.equal(selectedUsers.length, 4);
    assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son'));
    await click('.bigadd', container);
    selectedGroups = find('.detail-instructors-list ul:eq(0) li', container);
    assert.equal(selectedGroups.length, 3);
    assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

    selectedUsers = find('.detail-instructors-list ul:eq(1) li', container);
    assert.equal(selectedUsers.length, 4);
    assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son'));
  });

  test('remove instructor group', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    await click(find('.instructor-selection-manager ul:eq(0) li'), container);
    let selectedGroups = find('.instructor-selection-manager ul:eq(0) li', container);
    assert.equal(selectedGroups.length, 2);
    assert.equal(getElementText(selectedGroups), getText('instructor group 1 instructor group 2'));

    let selectedUsers = find('.instructor-selection-manager ul:eq(1) li', container);
    assert.equal(selectedUsers.length, 3);
    assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
    await click('.bigadd', container);
    let groups = find('.detail-instructors-list ul:eq(0) li', container);
    assert.equal(groups.length, 2);
    assert.equal(getElementText(groups), getText('instructor group 1 instructor group 2'));

    let users = find('.detail-instructors-list ul:eq(1) li', container);
    assert.equal(users.length, 3);
    assert.equal(getElementText(users), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
  });

  test('remove instructor', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    await click(find('.instructor-selection-manager ul:eq(1) li'), container);
    let selectedGroups = find('.instructor-selection-manager ul:eq(0) li', container);
    assert.equal(selectedGroups.length, 3);
    assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

    let selectedUsers = find('.instructor-selection-manager ul:eq(1) li', container);
    assert.equal(selectedUsers.length, 2);
    assert.equal(getElementText(selectedUsers), getText('2 guy M. Mc2son 3 guy M. Mc3son'));
    await click('.bigadd', container);
    let groups = find('.detail-instructors-list ul:eq(0) li', container);
    assert.equal(groups.length, 3);
    assert.equal(getElementText(groups), getText('instructor group 0 instructor group 1 instructor group 2'));

    let users = find('.detail-instructors-list ul:eq(1) li', container);
    assert.equal(users.length, 2);
    assert.equal(getElementText(users), getText('2 guy M. Mc2son 3 guy M. Mc3son'));
  });

  test('undo instructor/group changes', async function(assert) {
    await visit(url);
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    await click('.actions button', container);
    await click(find('.instructor-selection-manager ul:eq(0) li'), container);
    await click(find('.instructor-selection-manager ul:eq(1) li'), container);
    let selectedGroups = find('.instructor-selection-manager ul:eq(0) li', container);
    assert.equal(selectedGroups.length, 2);
    assert.equal(getElementText(selectedGroups), getText('instructor group 1 instructor group 2'));

    let selectedUsers = find('.instructor-selection-manager ul:eq(1) li', container);
    assert.equal(selectedUsers.length, 2);
    assert.equal(getElementText(selectedUsers), getText('2 guy M. Mc2son 3 guy M. Mc3son'));
    await click('.bigcancel', container);
    let groups = find('.detail-instructors-list ul:eq(0) li', container);
    assert.equal(groups.length, 3);
    assert.equal(getElementText(groups), getText('instructor group 0 instructor group 1 instructor group 2'));

    let users = find('.detail-instructors-list ul:eq(1) li', container);
    assert.equal(users.length, 3);
    assert.equal(getElementText(users), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
  });
});
