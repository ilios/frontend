import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/dashboard/selected-vocabulary';
import SelectedVocabulary from 'ilios-common/components/dashboard/selected-vocabulary';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | dashboard/selected-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = this.server.create('vocabulary');
    this.server.create('term', {
      title: 'top 1',
      vocabulary,
    });
    const term2 = this.server.create('term', {
      title: 'top 2',
      vocabulary,
    });
    this.server.create('term', {
      title: 'top 2 child 1',
      parent: term2,
      vocabulary,
    });
    this.vocabularyModel = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', vocabulary.id);
  });

  test('it renders', async function (assert) {
    this.set('vocabulary', this.vocabularyModel);
    this.set('selectedTermIds', ['3']);
    await render(
      <template>
        <SelectedVocabulary
          @vocabulary={{this.vocabulary}}
          @selectedTermIds={{this.selectedTermIds}}
          @add={{(noop)}}
          @remove={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Vocabulary 1');
    assert.strictEqual(component.selectedTermTree.checkboxes.length, 3);
    assert.strictEqual(component.selectedTermTree.checkboxes[0].text, 'top 1');
    assert.notOk(component.selectedTermTree.checkboxes[0].isChecked);
    assert.strictEqual(component.selectedTermTree.checkboxes[1].text, 'top 2');
    assert.notOk(component.selectedTermTree.checkboxes[1].isChecked);
    assert.strictEqual(component.selectedTermTree.checkboxes[2].text, 'top 2 child 1');
    assert.ok(component.selectedTermTree.checkboxes[2].isChecked);
    assert.strictEqual(component.selectedTermTree.children.length, 1);
  });

  test('clicking unchecked checkbox fires add', async function (assert) {
    assert.expect(1);
    this.set('vocabulary', this.vocabularyModel);
    this.set('add', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <SelectedVocabulary
          @vocabulary={{this.vocabulary}}
          @selectedTermIds={{(array)}}
          @add={{this.add}}
          @remove={{(noop)}}
        />
      </template>,
    );
    await component.selectedTermTree.checkboxes[0].click();
  });

  test('clicking checked checkbox fires add', async function (assert) {
    assert.expect(1);
    this.set('vocabulary', this.vocabularyModel);
    this.set('selectedTermIds', ['1']);
    this.set('remove', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <SelectedVocabulary
          @vocabulary={{this.vocabulary}}
          @selectedTermIds={{this.selectedTermIds}}
          @add={{(noop)}}
          @remove={{this.remove}}
        />
      </template>,
    );
    await component.selectedTermTree.checkboxes[0].click();
  });
});
