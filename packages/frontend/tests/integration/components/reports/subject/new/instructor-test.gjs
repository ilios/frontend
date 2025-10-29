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
    const school = this.server.create('school');
    this.server.createList('user', 4, { school });
    this.server.create('user', { school, enabled: false });
  });

  test('it works', async function (assert) {
    this.set('currentId', null);
    this.set('changeId', (userId) => {
      assert.step('changeId called');
      assert.strictEqual(userId, '3');
      this.set('currentId', userId);
    });
    await render(
      <template><Instructor @currentId={{this.currentId}} @changeId={{this.changeId}} /></template>,
    );
    assert.notOk(component.hasSelectedInstructor);
    await component.userSearch.searchBox.set('guy');
    assert.strictEqual(component.userSearch.results.items.length, 5);
    assert.strictEqual(
      component.userSearch.results.items[2].text,
      '2 guy M. Mc2son user@example.edu',
    );
    await component.userSearch.results.items[2].click();
    assert.ok(component.hasSelectedInstructor);
    assert.strictEqual(component.selectedInstructor, '2 guy M. Mc2son');
    assert.verifySteps(['changeId called']);
  });

  test('it works with inactive user', async function (assert) {
    this.set('currentId', null);
    this.set('changeId', (userId) => {
      assert.step('changeId called');
      assert.strictEqual(userId, '5');
      this.set('currentId', userId);
    });
    await render(
      <template><Instructor @currentId={{this.currentId}} @changeId={{this.changeId}} /></template>,
    );
    assert.notOk(component.hasSelectedInstructor);
    await component.userSearch.searchBox.set('guy');
    assert.strictEqual(component.userSearch.results.items.length, 5);
    assert.strictEqual(
      component.userSearch.results.items[4].text,
      '4 guy M. Mc4son disabled user account user@example.edu',
    );
    await component.userSearch.results.items[4].click();
    assert.ok(component.hasSelectedInstructor);
    assert.strictEqual(component.selectedInstructor, '4 guy M. Mc4son');
    assert.verifySteps(['changeId called']);
  });

  test('removing instructor clears value', async function (assert) {
    this.set('currentId', '2');
    this.set('changeId', (userId) => {
      assert.step('changeId called');
      assert.strictEqual(userId, null);
      this.set('currentId', null);
    });
    await render(
      <template><Instructor @currentId={{this.currentId}} @changeId={{this.changeId}} /></template>,
    );
    assert.ok(component.hasSelectedInstructor);
    await component.removeSelectedInstructor();
    assert.notOk(component.hasSelectedInstructor);
    assert.verifySteps(['changeId called']);
  });
});
