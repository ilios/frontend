import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | selectable terms list item', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('selected term', async function(assert) {
    assert.expect(3);

    const term = this.server.create('term', { 'title': 'term1' });
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('selectedTerms', [ termModel ]);
    this.set('term', termModel);
    this.set('remove', term => {
      assert.equal(term, termModel);
    });

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
      @remove={{action this.remove}}
    />`);

    assert.dom('.selected').exists({ count: 1 });
    assert.dom('.actions .fa-times').exists({ count: 1 });
    await click('.fa-times');
  });

  test('unselected term', async function(assert) {
    assert.expect(3);

    const term = this.server.create('term', { 'title': 'term1' });
    const termModel = await this.owner.lookup('service:store').find('term', term.id);

    this.set('selectedTerms', []);
    this.set('term', termModel);
    this.set('add', term => {
      assert.equal(term, termModel);
    });

    await render(hbs`<SelectableTermsListItem
      @selectedTerms={{this.selectedTerms}}
      @term={{this.term}}
      @add={{action this.add}}
    />`);

    assert.dom('.selected').doesNotExist();
    assert.dom('.actions .fa-plus').exists({ count: 1 });
    await click('.fa-plus');
  });
});
