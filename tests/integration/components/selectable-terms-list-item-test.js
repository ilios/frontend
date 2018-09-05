import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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
    this.actions.remove = (term) => {
      assert.equal(term, term1);
    };

    await render(hbs`{{selectable-terms-list-item selectedTerms=selectedTerms term=term remove='remove'}}`);

    assert.equal(this.$('.selected').length, 1);
    assert.equal(this.$('.actions .fa-times').length, 1);
    this.$('.fa-times').click();
  });

  test('unselected term', async function(assert) {
    assert.expect(3);
    const term1 = EmberObject.create({
      title: 'term1',
    });

    const selectedTerms = [];
    this.set('selectedTerms', selectedTerms);
    this.set('term', term1);
    this.actions.add = (term) => {
      assert.equal(term, term1);
    };

    await render(hbs`{{selectable-terms-list-item selectedTerms=selectedTerms term=term add='add'}}`);

    assert.equal(this.$('.selected').length, 0);
    assert.equal(this.$('.actions .fa-plus').length, 1);
    this.$('.fa-plus').click();
  });
});
