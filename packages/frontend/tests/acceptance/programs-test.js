import { click, fillIn, find, currentURL, currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/programs';
import detailPage from 'frontend/tests/pages/program';
import percySnapshot from '@percy/ember';
import { getUniqueName } from '../helpers/percy-snapshot-name';

module('Acceptance | Programs', function (hooks) {
  setupApplicationTest(hooks);

  module('User in single school with no special permissions', function (hooks) {
    hooks.beforeEach(async function () {
      this.school = this.server.create('school');
      this.user = await setupAuthentication({ school: this.school });
    });

    test('visiting /programs', async function (assert) {
      assert.expect(1);
      await page.visit();
      await percySnapshot(assert);
      assert.strictEqual(currentRouteName(), 'programs');
    });

    test('add new program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(3);
      const url = '/programs';
      const expandButton = '.expand-button';
      const input = '.new-program input';
      const saveButton = '.new-program .done';
      const savedLink = '.saved-result a';

      await visit(url);
      await click(expandButton);
      await percySnapshot(getUniqueName(assert, 'expandButton'));
      await fillIn(input, 'Test Title');
      await click(saveButton);
      await percySnapshot(getUniqueName(assert, 'saveButton'));
      function getContent(i) {
        return find(`tbody tr td:nth-of-type(${i + 1})`).textContent.trim();
      }

      assert.dom(savedLink).hasText('Test Title', 'link is visisble');
      assert.strictEqual(getContent(0), 'Test Title', 'program is correct');
      assert.strictEqual(getContent(1), 'school 0', 'school is correct');
    });

    test('remove program', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(6);
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
    await setupAuthentication({ school: schools[1] });
    await page.visit();
    assert.strictEqual(page.root.schoolFilter.schools.length, 2);
    assert.strictEqual(page.root.schoolFilter.schools[0].text, 'school 0');
    assert.strictEqual(page.root.schoolFilter.schools[1].text, 'school 1');
    assert.strictEqual(page.root.schoolFilter.selectedSchool, '2');
  });
});
