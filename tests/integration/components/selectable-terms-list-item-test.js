import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | selectable terms list item', function(hooks) {
  setupRenderingTest(hooks);

  test('selected term', async function(assert) {
    assert.expect(3);
    const term1 = EmberObject.create({
      title: 'term1',
    });

    const selectedTerms = [ term1 ];
    this.set('selectedTerms', selectedTerms);
    this.set('term', term1);
    this.set('remove', term => {
      assert.equal(term, term1);
    });

    await render(hbs`{{selectable-terms-list-item selectedTerms=selectedTerms term=term remove=remove}}`);

    assert.dom('.selected').exists({ count: 1 });
    assert.dom('.actions .fa-times').exists({ count: 1 });
    await click('.fa-times');
  });

  test('unselected term', async function(assert) {
    assert.expect(3);
    const term1 = EmberObject.create({
      title: 'term1',
    });

    const selectedTerms = [];
    this.set('selectedTerms', selectedTerms);
    this.set('term', term1);
    this.set('add', term => {
      assert.equal(term, term1);
    });

    await render(hbs`{{selectable-terms-list-item selectedTerms=selectedTerms term=term add=add}}`);

    assert.dom('.selected').doesNotExist();
    assert.dom('.actions .fa-plus').exists({ count: 1 });
    await click('.fa-plus');
  });
});
