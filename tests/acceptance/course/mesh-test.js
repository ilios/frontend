import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'dummy/tests/helpers';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Mesh Terms', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('academicYear');
    this.server.createList('meshTree', 3);
    this.server.createList('meshConcept', 3);

    this.server.create('meshConcept', {
      scopeNote: '1234567890'.repeat(30),
    });

    this.server.create('meshDescriptor', {
      conceptIds: [1, 2, 3, 4],
      treeIds: [1, 2, 3],
    });
    this.server.create('meshDescriptor', {
      deleted: true,
    });
    this.server.createList('meshDescriptor', 4);

    this.course = this.server.create('course', {
      year: 2014,
      school: this.school,
      meshDescriptorIds: [1, 2, 3],
    });
  });

  test('list mesh', async function (assert) {
    assert.expect(4);
    await page.visit({ courseId: this.course.id, details: true });
    assert.strictEqual(page.details.meshTerms.current.length, 3);
    assert.strictEqual(page.details.meshTerms.current[0].title, 'descriptor 0');
    assert.strictEqual(page.details.meshTerms.current[1].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.current[2].title, 'descriptor 2');
  });

  test('manage terms', async function (assert) {
    assert.expect(24);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, details: true });
    assert.strictEqual(page.details.meshTerms.current.length, 3);
    await page.details.meshTerms.manage();
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms.length, 3);
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 0');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 2');
    await page.details.meshTerms.meshManager.search.set('descriptor');
    assert.strictEqual(page.details.meshTerms.meshManager.searchResults.length, 6);
    for (let i = 0; i < 6; i++) {
      assert.strictEqual(
        page.details.meshTerms.meshManager.searchResults[i].title,
        `descriptor ${i}`
      );
    }
    assert.ok(page.details.meshTerms.meshManager.searchResults[0].isDisabled);
    assert.ok(page.details.meshTerms.meshManager.searchResults[1].isDisabled);
    assert.ok(page.details.meshTerms.meshManager.searchResults[2].isDisabled);
    assert.ok(page.details.meshTerms.meshManager.searchResults[3].isEnabled);
    assert.ok(page.details.meshTerms.meshManager.searchResults[4].isEnabled);
    assert.ok(page.details.meshTerms.meshManager.searchResults[5].isEnabled);
    await page.details.meshTerms.meshManager.searchResults[3].add();
    assert.ok(page.details.meshTerms.meshManager.searchResults[3].isDisabled);
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms.length, 4);
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 0');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 2');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[3].title, 'descriptor 3');
  });

  test('save terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(9);
    await page.visit({ courseId: this.course.id, details: true });
    assert.strictEqual(page.details.meshTerms.current.length, 3);
    await page.details.meshTerms.manage();

    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms.length, 3);
    await page.details.meshTerms.meshManager.selectedTerms[0].remove();
    await page.details.meshTerms.meshManager.search.set('descriptor');
    await page.details.meshTerms.meshManager.searchResults[3].add();

    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 2');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 3');

    await page.details.meshTerms.save();
    assert.strictEqual(page.details.meshTerms.current.length, 3);
    assert.strictEqual(page.details.meshTerms.current[0].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.current[1].title, 'descriptor 2');
    assert.strictEqual(page.details.meshTerms.current[2].title, 'descriptor 3');
  });

  test('cancel term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    assert.expect(11);
    await page.visit({ courseId: this.course.id, details: true });
    assert.strictEqual(page.details.meshTerms.current.length, 3);
    assert.strictEqual(page.details.meshTerms.current[0].title, 'descriptor 0');
    assert.strictEqual(page.details.meshTerms.current[1].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.current[2].title, 'descriptor 2');

    await page.details.meshTerms.manage();
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms.length, 3);

    await page.details.meshTerms.meshManager.selectedTerms[0].remove();
    await page.details.meshTerms.meshManager.search.set('descriptor');
    await page.details.meshTerms.meshManager.searchResults[3].add();

    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[0].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[1].title, 'descriptor 2');
    assert.strictEqual(page.details.meshTerms.meshManager.selectedTerms[2].title, 'descriptor 3');

    await page.details.meshTerms.cancel();
    assert.strictEqual(page.details.meshTerms.current[0].title, 'descriptor 0');
    assert.strictEqual(page.details.meshTerms.current[1].title, 'descriptor 1');
    assert.strictEqual(page.details.meshTerms.current[2].title, 'descriptor 2');
  });
});
