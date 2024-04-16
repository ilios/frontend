import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'frontend/tests/pages/assign-students';
import percySnapshot from '@percy/ember';

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
    assert.expect(3);
    await page.visit();
    await percySnapshot(assert);
    assert.strictEqual(page.root.schoolFilter.text, 'school 0');
    assert.strictEqual(page.root.schoolFilter.options.length, 0);
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
    assert.strictEqual(page.root.schoolFilter.selectedSchool, this.school.id);
    assert.strictEqual(page.root.schoolFilter.options.length, 2);
    assert.strictEqual(page.root.schoolFilter.options[0].text, 'school 0');
    assert.strictEqual(page.root.schoolFilter.options[1].text, 'school 1');
  });

  test('users are listed in full name by default', async function (assert) {
    await page.visit();
    assert.strictEqual(page.root.manager.students.length, 2);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Aardvark');
    assert.ok(page.root.manager.students[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.root.manager.students[1].userNameInfo.fullName, 'Clem M. Chowder');
    assert.notOk(page.root.manager.students[1].userNameInfo.hasAdditionalInfo);
  });
});
