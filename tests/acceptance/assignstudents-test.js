import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from '../pages/assign-students';

// @todo flesh this acceptance test out [ST 2020/08/14]
module('Acceptance | assign students', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.school2 = this.server.create('school');
    this.server.createList('userRole', 5);
    this.server.create('user', {
      school: this.school,
      roleIds: [4],
      firstName: 'Clem',
      lastName: 'Chowder',
    });
    this.server.create('user', {
      school: this.school,
      roleIds: [4],
      displayName: 'Aardvark',
    });
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
  });

  test('visiting /admin/assignstudents', async function (assert) {
    await page.visit();
    assert.strictEqual(page.schoolFilter.text, 'school 0');
    assert.strictEqual(page.schoolFilter.options.length, 0);
    assert.strictEqual(currentURL(), '/admin/assignstudents');
  });

  test('school filter', async function (assert) {
    this.server.create('user', {
      school: this.school2,
      roleIds: [4],
      displayName: 'Aardvark',
    });
    await setupAuthentication({
      school: this.school,
      administeredSchools: [this.school, this.school2],
    });
    await page.visit();
    assert.strictEqual(page.schoolFilter.selectedSchool, this.school.id);
    assert.strictEqual(page.schoolFilter.options.length, 2);
    assert.strictEqual(page.schoolFilter.options[0].text, 'school 0');
    assert.strictEqual(page.schoolFilter.options[1].text, 'school 1');
  });

  test('users are listed in full name by default', async function (assert) {
    await page.visit();
    assert.strictEqual(page.assignStudents.students.length, 2);
    assert.strictEqual(page.assignStudents.students[0].name.userNameInfo.fullName, 'Aardvark');
    assert.ok(page.assignStudents.students[0].name.userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      page.assignStudents.students[1].name.userNameInfo.fullName,
      'Clem M. Chowder'
    );
    assert.notOk(page.assignStudents.students[1].name.userNameInfo.hasAdditionalInfo);
  });
});
