import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/selected-vocabulary';

module('Integration | Component | dashboard/selected-vocabulary', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
    await render(hbs`<Dashboard::SelectedVocabulary
      @vocabulary={{this.vocabulary}}
      @selectedTermIds={{this.selectedTermIds}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />
`);
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
    await render(hbs`<Dashboard::SelectedVocabulary
      @vocabulary={{this.vocabulary}}
      @selectedTermIds={{(array)}}
      @add={{this.add}}
      @remove={{(noop)}}
    />
`);
    await component.selectedTermTree.checkboxes[0].click();
  });

  test('clicking checked checkbox fires add', async function (assert) {
    assert.expect(1);
    this.set('vocabulary', this.vocabularyModel);
    this.set('selectedTermIds', ['1']);
    this.set('remove', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(hbs`<Dashboard::SelectedVocabulary
      @vocabulary={{this.vocabulary}}
      @selectedTermIds={{this.selectedTermIds}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />
`);
    await component.selectedTermTree.checkboxes[0].click();
  });
});
