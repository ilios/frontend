import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/dashboard/selected-vocabulary';
import SelectedVocabulary from 'frontend/components/dashboard/selected-vocabulary';
import noop from 'frontend/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | dashboard/selected-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const vocabulary = await this.server.create('vocabulary');
    await this.server.create('term', {
      title: 'top 1',
      vocabulary,
    });
    const term2 = await this.server.create('term', {
      title: 'top 2',
      vocabulary,
    });
    await this.server.create('term', {
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
          @addVocabularyInView={{(noop)}}
          @removeVocabularyInView={{(noop)}}
          @addTitleInView={{(noop)}}
          @removeTitleInView={{(noop)}}
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
    this.set('vocabulary', this.vocabularyModel);
    this.set('add', (id) => {
      assert.step('add called');
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <SelectedVocabulary
          @vocabulary={{this.vocabulary}}
          @selectedTermIds={{(array)}}
          @add={{this.add}}
          @remove={{(noop)}}
          @addVocabularyInView={{(noop)}}
          @removeVocabularyInView={{(noop)}}
          @addTitleInView={{(noop)}}
          @removeTitleInView={{(noop)}}
        />
      </template>,
    );
    await component.selectedTermTree.checkboxes[0].click();
    assert.verifySteps(['add called']);
  });

  test('clicking checked checkbox fires add', async function (assert) {
    this.set('vocabulary', this.vocabularyModel);
    this.set('selectedTermIds', ['1']);
    this.set('remove', (id) => {
      assert.step('remove called');
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <SelectedVocabulary
          @vocabulary={{this.vocabulary}}
          @selectedTermIds={{this.selectedTermIds}}
          @add={{(noop)}}
          @remove={{this.remove}}
          @addVocabularyInView={{(noop)}}
          @removeVocabularyInView={{(noop)}}
          @addTitleInView={{(noop)}}
          @removeTitleInView={{(noop)}}
        />
      </template>,
    );
    await component.selectedTermTree.checkboxes[0].click();
    assert.verifySteps(['remove called']);
  });
});
