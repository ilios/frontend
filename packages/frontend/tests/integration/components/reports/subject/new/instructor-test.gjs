import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/instructor';
import Instructor from 'frontend/components/reports/subject/new/instructor';

module('Integration | Component | reports/subject/new/instructor', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.createList('user', 5, { school: this.server.create('school') });
  });

  test('it works', async function (assert) {
    assert.expect(5);
    this.set('currentId', null);
    this.set('changeId', (userId) => {
      assert.strictEqual(userId, '3');
      this.set('currentId', userId);
    });
    await render(
      <template><Instructor @currentId={{this.currentId}} @changeId={{this.changeId}} /></template>,
    );
    assert.notOk(component.hasSelectedInstructor);
    await component.userSearch.searchBox.set('guy');
    assert.strictEqual(component.userSearch.results.items.length, 5);
    await component.userSearch.results.items[2].click();
    assert.ok(component.hasSelectedInstructor);
    assert.strictEqual(component.selectedInstructor, '2 guy M. Mc2son');
  });

  test('removing instructor clears value', async function (assert) {
    assert.expect(3);
    this.set('currentId', '2');
    this.set('changeId', (userId) => {
      assert.strictEqual(userId, null);
      this.set('currentId', null);
    });
    await render(
      <template><Instructor @currentId={{this.currentId}} @changeId={{this.changeId}} /></template>,
    );
    assert.ok(component.hasSelectedInstructor);
    await component.removeSelectedInstructor();
    assert.notOk(component.hasSelectedInstructor);
  });
});
