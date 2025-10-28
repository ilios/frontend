import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/selectable-terms-list-item';
import SelectableTermsListItem from 'ilios-common/components/selectable-terms-list-item';

module('Integration | Component | selectable terms list item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const term = this.server.create('term', { title: 'Term1' });
    this.termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
  });

  test('it renders', async function (assert) {
    this.set('selectedTerms', [this.termModel]);
    this.set('term', this.termModel);

    await render(
      <template>
        <SelectableTermsListItem @selectedTerms={{this.selectedTerms}} @term={{this.term}} />
      </template>,
    );

    assert.strictEqual(component.text, this.termModel.get('title'));
  });

  test('selected term', async function (assert) {
    this.set('selectedTerms', [this.termModel]);
    this.set('term', this.termModel);
    this.set('remove', (term) => {
      assert.step('remove called');
      assert.strictEqual(term, this.termModel);
      this.set(
        'selectedTerms',
        this.selectedTerms.filter((t) => t !== term),
      );
    });

    await render(
      <template>
        <SelectableTermsListItem
          @selectedTerms={{this.selectedTerms}}
          @term={{this.term}}
          @remove={{this.remove}}
        />
      </template>,
    );

    assert.ok(component.isSelected);
    await component.click();
    assert.notOk(component.isSelected);
    assert.verifySteps(['remove called']);
  });

  test('unselected term', async function (assert) {
    this.set('selectedTerms', []);
    this.set('term', this.termModel);
    this.set('add', (term) => {
      assert.step('add called');
      assert.strictEqual(term, this.termModel);
      this.set('selectedTerms', [...this.selectedTerms, term]);
    });

    await render(
      <template>
        <SelectableTermsListItem
          @selectedTerms={{this.selectedTerms}}
          @term={{this.term}}
          @add={{this.add}}
        />
      </template>,
    );

    assert.notOk(component.isSelected);
    await component.click();
    assert.ok(component.isSelected);
    assert.verifySteps(['add called']);
  });
});
