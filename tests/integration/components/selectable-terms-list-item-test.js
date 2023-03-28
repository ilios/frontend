import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/selectable-terms-list-item';

module('Integration | Component | selectable terms list item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const term = this.server.create('term', { title: 'Term1' });
    this.termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
  });

  test('it renders', async function (assert) {
    this.set('selectedTerms', [this.termModel]);
    this.set('term', this.termModel);

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
    />
`);

    assert.strictEqual(component.text, this.termModel.get('title'));
  });

  test('selected term', async function (assert) {
    assert.expect(3);

    this.set('selectedTerms', [this.termModel]);
    this.set('term', this.termModel);
    this.set('remove', (term) => {
      assert.strictEqual(term, this.termModel);
      this.set(
        'selectedTerms',
        this.selectedTerms.filter((t) => t !== term)
      );
    });

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
      @remove={{this.remove}}
    />
`);

    assert.ok(component.isSelected);
    await component.click();
    assert.notOk(component.isSelected);
  });

  test('unselected term', async function (assert) {
    assert.expect(3);

    this.set('selectedTerms', []);
    this.set('term', this.termModel);
    this.set('add', (term) => {
      assert.strictEqual(term, this.termModel);
      this.set('selectedTerms', [...this.selectedTerms, term]);
    });

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
      @add={{this.add}}
    />
`);

    assert.notOk(component.isSelected);
    await component.click();
    assert.ok(component.isSelected);
  });
});
