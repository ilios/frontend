import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/session';

module('Acceptance: Session - Offering Management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ school: this.school, administeredSchools: [this.school]});
  });

  test('search for instructor who is a course director #2838', async function(assert) {
    assert.expect(1);

    const permission1 = this.server.create('permission', {
      tableRowId: '1',
      tableName: 'school'
    });
    const users = this.server.createList('user', 3, {
      school: this.school,
      permissions: [permission1],
    });
    const course = this.server.create('course', {
      school: this.school,
      directors: [users[0], users[1], users[2]],
    });
    const session = this.server.create('session', {
      course,
    });
    this.server.create('offering', {
      session,
    });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.dateBlocks(0).offerings(0).edit();

    const { offeringForm: form } = page.offerings;
    await form.instructorSelectionManager.search('guy 3');
    assert.equal(form.instructorSelectionManager.searchResults().count, 1);
  });

  test('searching for course directors as instructors does not remove existing instructors #3479', async function(assert) {
    assert.expect(10);

    const permission1 = this.server.create('permission', {
      tableRowId: '1',
      tableName: 'school'
    });
    const users = this.server.createList('user', 3, {
      school: this.school,
      permissions: [permission1],
    });
    const course = this.server.create('course', {
      school: this.school,
      directors: [users[0], users[1]],
    });
    const session = this.server.create('session', {
      course,
    });
    this.server.create('offering', {
      session
    });

    await page.visit({ courseId: 1, sessionId: 1 });
    await page.offerings.dateBlocks(0).offerings(0).edit();

    const { offeringForm: form } = page.offerings;
    assert.equal(form.instructorSelectionManager.instructors().count, 0);
    await form.instructorSelectionManager.search('guy 2');
    assert.equal(form.instructorSelectionManager.searchResults().count, 1);
    await form.instructorSelectionManager.searchResults(0).add();
    assert.equal(form.instructorSelectionManager.instructors().count, 1);
    assert.equal(form.instructorSelectionManager.instructors(0).text, '2 guy M. Mc2son');

    await form.instructorSelectionManager.search('guy 3');
    assert.equal(form.instructorSelectionManager.instructors().count, 1);
    assert.equal(form.instructorSelectionManager.instructors(0).text, '2 guy M. Mc2son');
    assert.equal(form.instructorSelectionManager.searchResults().count, 1);
    await form.instructorSelectionManager.searchResults(0).add();
    assert.equal(form.instructorSelectionManager.instructors().count, 2);
    assert.equal(form.instructorSelectionManager.instructors(0).text, '2 guy M. Mc2son');
    assert.equal(form.instructorSelectionManager.instructors(1).text, '3 guy M. Mc3son');
  });
});
