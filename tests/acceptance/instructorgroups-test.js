import {
  click,
  fillIn,
  find,
  findAll,
  currentURL,
  currentRouteName,
  visit
} from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';

import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios-common';

module('Acceptance | Instructor Groups', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('User in single school', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication( { school: this.school } );
    });

    test('visiting /instructorgroups', async function(assert) {
      await visit('/instructorgroups');
      assert.equal(currentRouteName(), 'instructorGroups');
    });

    test('list groups', async function(assert) {
      this.server.createList('user', 5);
      this.server.createList('course', 2, {school: this.school});
      this.server.create('session', {
        courseId: 1,
      });
      this.server.create('session', {
        courseId: 2,
      });
      let firstInstructorgroup = this.server.create('instructorGroup', {
        school: this.school,
        userIds: [2, 3, 4, 5, 6]
      });
      let secondInstructorgroup = this.server.create('instructorGroup', {
        school: this.school
      });
      this.server.create('offering', {
        instructorGroupIds: [1],
        sessionId: 1
      });
      this.server.create('offering', {
        instructorGroupIds: [1],
        sessionId: 2
      });

      assert.expect(7);
      await visit('/instructorgroups');
      assert.equal(2, findAll('.list tbody tr').length);
      assert.equal(await getElementText('.list tbody tr:nth-of-type(1) td:nth-of-type(1)'),getText(firstInstructorgroup.title));
      assert.equal(await getElementText('.list tbody tr:nth-of-type(1) td:nth-of-type(2)'), 5);
      assert.equal(await getElementText('.list tbody tr:nth-of-type(1) td:nth-of-type(3)'), 2);

      assert.equal(await getElementText('.list tbody tr:nth-of-type(2) td:nth-of-type(1)'),getText(secondInstructorgroup.title));
      assert.equal(await getElementText('.list tbody tr:nth-of-type(2) td:nth-of-type(2)'), 0);
      assert.equal(await getElementText('.list tbody tr:nth-of-type(2) td:nth-of-type(3)'), 0);
    });

    test('filters by title', async function(assert) {
      this.server.create('school');
      let firstInstructorgroup = this.server.create('instructorGroup', {
        title: 'specialfirstinstructorgroup',
        school: this.school,
      });
      let secondInstructorgroup = this.server.create('instructorGroup', {
        title: 'specialsecondinstructorgroup',
        school: this.school
      });
      let regularInstructorgroup = this.server.create('instructorGroup', {
        title: 'regularinstructorgroup',
        school: this.school
      });
      let regexInstructorgroup = this.server.create('instructorGroup', {
        title: '\\yoo hoo',
        school: this.school
      });
      assert.expect(19);
      await visit('/instructorgroups');
      assert.equal(4, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(regexInstructorgroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))),getText(regularInstructorgroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(3) td'))),getText(firstInstructorgroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(4) td'))),getText(secondInstructorgroup.title));

      await fillIn('.titlefilter input', 'first');
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText(firstInstructorgroup.title));

      await fillIn('.titlefilter input', 'second');
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))), getText(secondInstructorgroup.title));

      await fillIn('.titlefilter input', 'special');
      assert.equal(2, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(firstInstructorgroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))),getText(secondInstructorgroup.title));

      await fillIn('.titlefilter input', '\\');
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(regexInstructorgroup.title));

      await fillIn('.titlefilter input', '');
      assert.equal(4, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText(regexInstructorgroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(2) td'))),getText(regularInstructorgroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(3) td'))),getText(firstInstructorgroup.title));
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(4) td'))),getText(secondInstructorgroup.title));
    });

    test('add new instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(1);
      await visit('/instructorgroups');
      let newTitle = 'new test tile';
      await click('.actions button');
      await fillIn('.newinstructorgroup-title input', newTitle);
      await click('.new-instructorgroup .done');
      assert.equal(await getElementText(find('.saved-result')), getText(newTitle + 'Saved Successfully'));
    });

    test('cancel adding new instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(6);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await visit('/instructorgroups');
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('instructorgroup 0'));
      await click('.actions button');
      assert.dom('.new-instructorgroup').exists({ count: 1 });
      await click('.new-instructorgroup .cancel');
      assert.dom('.new-instructorgroup').doesNotExist();
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('instructorgroup 0'));
    });

    test('remove instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(4);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await visit('/instructorgroups');
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('instructorgroup 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      await click('.confirm-buttons .remove');
      assert.equal(0, findAll('.list tbody [data-test-active-row]').length);
      assert.dom('.list tbody [data-test-empty-list]').exists();
    });

    test('cancel remove instructorgroup', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(4);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await visit('/instructorgroups');
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('instructorgroup 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      await click('.confirm-buttons .done');
      assert.dom('.list tbody [data-test-active-row]').exists({ count: 1 });
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('instructorgroup 0'));
    });

    test('confirmation of remove message', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      const users = this.server.createList('user', 5);
      this.server.create('instructorGroup', {
        school: this.school,
        users,
      });

      assert.expect(5);
      await visit('/instructorgroups');
      assert.equal(1, findAll('.list tbody [data-test-active-row]').length);
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('instructorgroup 0'));
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
      assert.dom('.list tbody [data-test-active-row]').hasClass('confirm-removal');
      assert.dom(findAll('.list tbody tr')[1]).hasClass('confirm-removal');
      assert.equal(await getElementText(find(findAll('.list tbody tr')[1])), getText('Are you sure you want to delete this instructor group, with 5 instructors? This action cannot be undone. Yes Cancel'));
    });

    test('click edit takes you to instructorgroup route', async function(assert) {
      assert.expect(1);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await visit('/instructorgroups');
      let edit = find('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .edit');
      await click(edit);
      assert.equal(currentURL(), '/instructorgroups/1');
    });

    test('click title takes you to instructorgroup route', async function(assert) {
      assert.expect(1);
      this.server.create('instructorGroup', {
        school: this.school,
      });
      await visit('/instructorgroups');
      await click('.list tbody tr:nth-of-type(1) td:nth-of-type(1) a');
      assert.equal(currentURL(), '/instructorgroups/1');
    });

    test('title filter escapes regex', async function(assert) {
      assert.expect(4);
      this.server.create('instructorGroup', {
        title: 'yes\\no',
        school: this.school,
      });

      const groups = '.list tbody [data-test-active-row]';
      const firstGroupTitle = `${groups}:nth-of-type(1) td:nth-of-type(1)`;
      const filter = '.titlefilter input';
      await visit('/instructorgroups');

      assert.dom(groups).exists({ count: 1 });
      assert.equal(await getElementText(firstGroupTitle), 'yes\\no');
      await fillIn(filter, '\\');
      assert.dom(groups).exists({ count: 1 });
      assert.equal(await getElementText(firstGroupTitle), 'yes\\no');
    });

    test('cannot delete instructorgroup with attached courses #3767', async function(assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(4);
      const group1 = this.server.create('instructorGroup', {
        school: this.school,
      });
      const group2 = this.server.create('instructorGroup', {
        school: this.school,
      });
      const course = this.server.create('course');
      const session1 = this.server.create('session', { course });
      const session2 = this.server.create('session', { course });
      this.server.create('ilm-session', { session: session1, instructorGroups: [group1] });
      this.server.create('offering', { session: session2, instructorGroups: [group2] });
      await visit('/instructorgroups');
      assert.dom('.list tbody [data-test-active-row]').exists({ count: 2 });
      assert.equal(await getElementText(find(find('.list tbody tr:nth-of-type(1) td'))),getText('instructorgroup 0'));
      assert.dom('.list tbody tr:nth-of-type(0) td:nth-of-type(4) .remove').doesNotExist();
      assert.dom('.list tbody tr:nth-of-type(1) td:nth-of-type(4) .remove').doesNotExist();
    });
  });

  test('filters options', async function(assert) {
    assert.expect(4);
    const schools = this.server.createList('school', 2);
    await setupAuthentication({
      school: schools[1],
    });

    const schoolSelect = '.schoolsfilter select';
    const options = `${schoolSelect} option`;

    await visit('/instructorgroups');
    let schoolOptions = findAll(options);
    assert.equal(schoolOptions.length, 2);
    assert.equal(await getElementText(schoolOptions[0]), 'school0');
    assert.equal(await getElementText(schoolOptions[1]), 'school1');
    assert.dom(schoolSelect).hasValue('2');
  });
});
