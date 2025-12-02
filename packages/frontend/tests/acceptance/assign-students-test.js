import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/assign-students';
import percySnapshot from '@percy/ember';
import { DateTime } from 'luxon';

module('Acceptance | assign students', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.school = this.server.create('school');
    this.school2 = this.server.create('school');
    const program = this.server.create('program', { school: this.school });
    const programYear = this.server.create('program-year', {
      program,
      startYear: DateTime.now().year,
    });
    this.server.create('cohort', { programYear });
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
  });

  test('visiting /admin/assignstudents', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
    await page.visit();
    await takeScreenshot(assert);
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
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
    await page.visit();
    assert.strictEqual(page.root.manager.students.length, 2);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Aardvark');
    assert.ok(page.root.manager.students[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.root.manager.students[1].userNameInfo.fullName, 'Clem M. Chowder');
    assert.notOk(page.root.manager.students[1].userNameInfo.hasAdditionalInfo);
  });

  test('applying text filter respects user selections', async function (assert) {
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
    await page.visit();
    assert.strictEqual(page.root.titleFilter.value, '');
    assert.strictEqual(page.root.manager.students.length, 2);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Aardvark');
    assert.strictEqual(page.root.manager.students[1].userNameInfo.fullName, 'Clem M. Chowder');
    assert.notOk(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
    assert.notOk(page.root.manager.students[0].isToggleChecked);
    assert.notOk(page.root.manager.students[1].isToggleChecked);
    await page.root.titleFilter.set('chow');
    assert.notOk(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
    assert.strictEqual(page.root.manager.students.length, 1);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Clem M. Chowder');
    await page.root.manager.students[0].toggle();
    assert.notOk(page.root.manager.isToggleAllIndeterminate);
    assert.ok(page.root.manager.isToggleAllChecked);
    await page.root.titleFilter.set('vark');
    assert.ok(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
    assert.strictEqual(page.root.manager.students.length, 2);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Aardvark');
    assert.strictEqual(page.root.manager.students[1].userNameInfo.fullName, 'Clem M. Chowder');
    assert.ok(page.root.manager.students[1].isToggleChecked);
    await page.root.manager.students[1].toggle();
    assert.notOk(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
    assert.strictEqual(page.root.manager.students.length, 1);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Aardvark');
    await page.root.manager.students[0].toggle();
    assert.notOk(page.root.manager.isToggleAllIndeterminate);
    assert.ok(page.root.manager.isToggleAllChecked);
    await page.root.titleFilter.set('');
    assert.strictEqual(page.root.manager.students.length, 2);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Aardvark');
    assert.strictEqual(page.root.manager.students[1].userNameInfo.fullName, 'Clem M. Chowder');
    assert.ok(page.root.manager.students[0].isToggleChecked);
    assert.notOk(page.root.manager.students[1].isToggleChecked);
    assert.ok(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
  });

  test('changing school filter resets user selections', async function (assert) {
    this.server.create('user', {
      school: this.school2,
      roleIds: [4],
      displayName: 'Zeb',
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
    assert.strictEqual(page.root.manager.students.length, 2);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Aardvark');
    assert.strictEqual(page.root.manager.students[1].userNameInfo.fullName, 'Clem M. Chowder');
    assert.notOk(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
    assert.notOk(page.root.manager.students[0].isToggleChecked);
    assert.notOk(page.root.manager.students[1].isToggleChecked);
    await page.root.manager.students[1].toggle();
    assert.ok(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
    await page.root.schoolFilter.set(this.school2.id);
    assert.strictEqual(page.root.schoolFilter.selectedSchool, this.school2.id);
    assert.notOk(page.root.manager.isToggleAllIndeterminate);
    assert.notOk(page.root.manager.isToggleAllChecked);
    assert.strictEqual(page.root.manager.students.length, 1);
    assert.strictEqual(page.root.manager.students[0].userNameInfo.fullName, 'Zeb');
    assert.notOk(page.root.manager.students[0].isToggleChecked);
  });
});
