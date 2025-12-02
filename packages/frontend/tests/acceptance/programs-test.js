import { currentURL, currentRouteName } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/programs';
import detailPage from 'frontend/tests/pages/program';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../helpers/percy-snapshot-name';

module('Acceptance | Programs', function (hooks) {
  setupApplicationTest(hooks);

  module('User in single school with no special permissions', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication({ school: this.school }, true);
    });

    test('visiting /programs', async function (assert) {
      await page.visit();
      await takeScreenshot(assert);
      await percySnapshot(assert);
      assert.strictEqual(currentRouteName(), 'programs');
    });

    test('add new program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit();

      assert.ok(page.root.toggleNewProgramFormExists);
      await page.root.toggleNewProgramForm();
      await percySnapshot(getUniqueName(assert, 'expandButton'));
      await takeScreenshot(assert, 'expandButton');
      await page.root.newProgramForm.title.set('Test Title');
      await page.root.newProgramForm.done.click();
      await percySnapshot(getUniqueName(assert, 'saveButton'));
      await takeScreenshot(assert, 'saveButton');
      assert.strictEqual(this.server.db.programs.length, 1);
      assert.strictEqual(page.root.list.items.length, 1);
      assert.dom('.flash-messages').exists({ count: 1 });
      assert.strictEqual(page.root.list.items[0].title, 'Test Title');
      assert.strictEqual(page.root.list.items[0].school, 'school 0');
    });

    test('remove program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('program', {
        school: this.school,
      });
      await page.visit();
      assert.strictEqual(this.server.db.programs.length, 1);
      assert.strictEqual(page.root.list.items.length, 1);
      assert.strictEqual(page.root.list.items[0].title, 'program 0');
      await page.root.list.items[0].remove();
      await page.root.list.items[0].confirmRemoval.confirm();
      assert.strictEqual(this.server.db.programs.length, 0);
      assert.strictEqual(page.root.list.items.length, 0);
      assert.dom('.flash-messages').exists({ count: 1 });
    });

    test('cancel remove program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      this.server.create('program', {
        school: this.school,
      });
      await page.visit();
      assert.strictEqual(this.server.db.programs.length, 1);
      assert.strictEqual(page.root.list.items.length, 1);
      assert.strictEqual(page.root.list.items[0].title, 'program 0');
      await page.root.list.items[0].remove();
      await page.root.list.items[0].confirmRemoval.cancel();
      assert.strictEqual(this.server.db.programs.length, 1);
      assert.strictEqual(page.root.list.items.length, 1);
    });

    test('click title takes you to program route', async function (assert) {
      this.server.create('program', {
        school: this.school,
      });
      await page.visit();
      await page.root.list.items[0].open();
      assert.strictEqual(currentURL(), '/programs/1');
    });
  });

  module('User in multiple schools', function (hooks) {
    hooks.beforeEach(async function () {
      this.school1 = this.server.create('school');
      this.school2 = this.server.create('school');
      this.program1 = this.server.create('program', { school: this.school1 });
      this.program2 = this.server.create('program', { school: this.school2 });
      this.user = await setupAuthentication();
    });

    test('remember non-default school filter choice', async function (assert) {
      await setupAuthentication({}, true);
      await page.visit();

      assert.strictEqual(currentURL(), '/programs');
      assert.strictEqual(page.root.schoolFilter.schools.length, 2);

      assert.strictEqual(page.root.schoolFilter.selectedSchool, '1');

      await page.root.schoolFilter.select(2);
      assert.strictEqual(page.root.schoolFilter.selectedSchool, '2');
      assert.strictEqual(currentURL(), '/programs?school=2');

      await page.root.list.items[0].open();
      assert.strictEqual(currentURL(), '/programs/2');

      await detailPage.root.goBack();

      assert.strictEqual(page.root.schoolFilter.selectedSchool, '2');
      assert.strictEqual(currentURL(), '/programs?school=2');
    });
  });

  test('filters options', async function (assert) {
    const schools = this.server.createList('school', 2);
    await setupAuthentication({ school: schools[1] }, true);
    await page.visit();
    assert.strictEqual(page.root.schoolFilter.schools.length, 2);
    assert.strictEqual(page.root.schoolFilter.schools[0].text, 'school 0');
    assert.strictEqual(page.root.schoolFilter.schools[1].text, 'school 1');
    assert.strictEqual(page.root.schoolFilter.selectedSchool, '2');
  });
});
