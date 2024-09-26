import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/mesh-term';

module('Integration | Component | reports/subject/new/mesh-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.createList('mesh-descriptor', 5);
  });

  test('it works', async function (assert) {
    assert.expect(5);
    this.set('currentId', null);
    this.set('changeId', (userId) => {
      assert.strictEqual(userId, '3');
      this.set('currentId', userId);
    });
    await render(hbs`<Reports::Subject::New::MeshTerm @currentId={{this.currentId}} @changeId={{this.changeId}} />`);
    assert.notOk(component.hasSelectedTerm);
    await component.meshManager.search.set('descriptor');
    assert.strictEqual(component.meshManager.searchResults.length, 5);
    await component.meshManager.searchResults[2].add();
    assert.ok(component.hasSelectedTerm);
    assert.strictEqual(component.selectedTerm, 'descriptor 2');
  });

  test('removing mesh term clears value', async function (assert) {
    assert.expect(3);
    this.set('currentId', '2');
    this.set('changeId', (userId) => {
      assert.strictEqual(userId, null);
      this.set('currentId', null);
    });
    await render(hbs`<Reports::Subject::New::MeshTerm @currentId={{this.currentId}} @changeId={{this.changeId}} />`);
    assert.ok(component.hasSelectedTerm);
    await component.removeSelectedTerm();
    assert.notOk(component.hasSelectedTerm);
  });
});
