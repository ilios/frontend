import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | selectable terms list item', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const term = this.server.create('term', { title: 'Term1' });
    this.termModel = await this.owner.lookup('service:store').find('term', term.id);
  });

  test('it renders', async function (assert) {
    assert.expect(1);

    this.set('selectedTerms', [this.termModel]);
    this.set('term', this.termModel);

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
    />`);

    assert.dom(this.element).hasText(this.termModel.get('title'));
  });

  test('selected term', async function (assert) {
    assert.expect(4);

    this.set('selectedTerms', [this.termModel]);
    this.set('term', this.termModel);
    this.set('remove', (term) => {
      assert.strictEqual(term, this.termModel);
      this.selectedTerms.removeObject(term);
    });

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
      @remove={{action this.remove}}
    />`);

    assert.dom('.selected').exists({ count: 1 });
    assert.dom('.actions .fa-xmark').exists({ count: 1 });
    await click('.fa-xmark');
    assert.dom('.selected').exists({ count: 0 });
  });

  test('unselected term', async function (assert) {
    assert.expect(4);

    this.set('selectedTerms', []);
    this.set('term', this.termModel);
    this.set('add', (term) => {
      assert.strictEqual(term, this.termModel);
      this.selectedTerms.pushObject(term);
    });

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
      @add={{action this.add}}
    />`);

    assert.dom('.selected').doesNotExist();
    assert.dom('.actions .fa-plus').exists({ count: 1 });
    await click('.fa-plus');
    assert.dom('.selected').exists({ count: 1 });
  });
});
