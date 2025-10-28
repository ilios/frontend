import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/mesh-manager';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import MeshManager from 'ilios-common/components/mesh-manager';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | mesh-manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.trees = this.server.createList('meshTree', 3);
    this.concepts = this.server.createList('meshConcept', 3);

    const concept = this.server.create('meshConcept', {
      scopeNote: '1234567890'.repeat(30),
    });
    this.concepts.push(concept);
  });

  test('searching works', async function (assert) {
    this.server.create('mesh-descriptor', {
      concepts: this.concepts,
      trees: this.trees,
    });
    this.server.create('mesh-descriptor', {
      deleted: true,
    });
    const descriptors = this.server.createList('mesh-descriptor', 3);

    this.set('terms', [descriptors[0], descriptors[2]]);
    await render(
      <template>
        <MeshManager @editable={{true}} @terms={{this.terms}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.selectedTerms.length, 2);
    assert.strictEqual(component.selectedTerms[0].title, 'descriptor 2');
    assert.strictEqual(component.selectedTerms[1].title, 'descriptor 4');
    await component.search.set('descriptor');

    assert.strictEqual(component.searchResults.length, 5);
    for (let i = 0; i < 5; i++) {
      assert.strictEqual(component.searchResults[i].title, `descriptor ${i}`);
    }
    assert.ok(component.searchResults[0].isEnabled);
    assert.ok(component.searchResults[1].isEnabled);
    assert.ok(component.searchResults[2].isDisabled);
    assert.ok(component.searchResults[3].isEnabled);
    assert.ok(component.searchResults[4].isDisabled);

    assert.notOk(component.showMoreIsVisible);
  });

  test('searching with more than 50 results', async function (assert) {
    this.server.createList('mesh-descriptor', 200);
    await render(
      <template>
        <MeshManager @editable={{true}} @terms={{(array)}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    await component.search.set('descriptor');

    assert.strictEqual(component.searchResults.length, 50);
    for (let i = 0; i < 50; i++) {
      assert.strictEqual(component.searchResults[i].title, `descriptor ${i}`);
    }
    assert.ok(component.showMoreIsVisible);
    await component.showMore();
    assert.strictEqual(component.searchResults.length, 100);
    for (let i = 0; i < 100; i++) {
      assert.strictEqual(component.searchResults[i].title, `descriptor ${i}`);
    }
  });

  test('clicking on unselected term adds it.', async function (assert) {
    const descriptors = this.server.createList('mesh-descriptor', 3);
    this.set('add', (term) => {
      assert.step('add called');
      assert.strictEqual(term.name, 'descriptor 1');
    });
    this.set('terms', [descriptors[0], descriptors[2]]);
    await render(
      <template>
        <MeshManager
          @editable={{true}}
          @terms={{this.terms}}
          @add={{this.add}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await component.search.set('descriptor');
    assert.ok(component.searchResults[1].isEnabled);
    assert.strictEqual(component.searchResults[1].title, 'descriptor 1');
    await component.searchResults[1].add();
    assert.verifySteps(['add called']);
  });

  test('clicking on selected term does not add it.', async function (assert) {
    const descriptors = this.server.createList('mesh-descriptor', 3);
    this.set('add', () => {
      assert.step('add called');
    });
    this.set('terms', descriptors);
    await render(
      <template>
        <MeshManager
          @editable={{true}}
          @terms={{this.terms}}
          @add={{this.add}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await component.search.set('descriptor');
    assert.ok(component.searchResults[0].isDisabled);
    await component.searchResults[0].add();
    assert.verifySteps([]);
  });

  test('no terms', async function (assert) {
    this.server.createList('mesh-descriptor', 3);
    await render(
      <template><MeshManager @editable={{true}} @add={{(noop)}} @remove={{(noop)}} /></template>,
    );
    await component.search.set('descriptor');
    assert.ok(component.searchResults[1].isEnabled);
    assert.strictEqual(component.searchResults[1].title, 'descriptor 1');
    await component.searchResults[1].add();
  });

  test('search term less than 3 characters', async function (assert) {
    this.server.createList('mesh-descriptor', 3);
    await render(
      <template><MeshManager @editable={{true}} @add={{(noop)}} @remove={{(noop)}} /></template>,
    );
    await component.search.set('ab');
    assert.strictEqual(component.searchResults.length, 1);
    assert.strictEqual(component.searchResults[0].text, 'keep typing...');
  });

  test('no search results', async function (assert) {
    this.server.createList('mesh-descriptor', 3);
    await render(
      <template><MeshManager @editable={{true}} @add={{(noop)}} @remove={{(noop)}} /></template>,
    );
    await component.search.set('geflarknik');
    assert.strictEqual(component.searchResults.length, 1);
    assert.strictEqual(component.searchResults[0].text, 'no results');
  });

  test('clicking outside of search results dismissed them.', async function (assert) {
    const descriptors = this.server.createList('mesh-descriptor', 3);
    this.set('terms', [descriptors[0], descriptors[2]]);
    await render(
      <template>
        <MeshManager @editable={{true}} @terms={{this.terms}} @add={{(noop)}} @remove={{(noop)}} />
      </template>,
    );
    await component.search.set('descriptor');
    assert.strictEqual(component.searchResults.length, 3);
    await component.search.click(); // click on anything outside the search results area, doesn't matter what.
    assert.strictEqual(component.search.value, '');
    assert.strictEqual(component.searchResults.length, 0);
  });
});
