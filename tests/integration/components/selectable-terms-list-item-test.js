import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

moduleForComponent('selectable-terms-list-item', 'Integration | Component | selectable terms list item', {
  integration: true
});

test('selected term', async function(assert) {
  assert.expect(3);
  const term1 = EmberObject.create({
    title: 'term1',
  });

  const selectedTerms = [ term1 ];
  this.set('selectedTerms', selectedTerms);
  this.set('term', term1);
  this.on('remove', (term) => {
    assert.equal(term, term1);
  });

  this.render(hbs`{{selectable-terms-list-item selectedTerms=selectedTerms term=term remove='remove'}}`);

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
  this.on('add', (term) => {
    assert.equal(term, term1);
  });

  this.render(hbs`{{selectable-terms-list-item selectedTerms=selectedTerms term=term add='add'}}`);

  assert.equal(this.$('.selected').length, 0);
  assert.equal(this.$('.actions .fa-plus').length, 1);
  this.$('.fa-plus').click();
});
