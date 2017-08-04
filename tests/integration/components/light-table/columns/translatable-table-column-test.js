import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { Column } from 'ember-light-table';

moduleForComponent('light-table/columns/translatable-table-column', 'Integration | Component | Columns | translatable-table-column', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{light-table/columns/translatable-table-column}}`);
  assert.equal(this.$().text().trim(), '');
});

test('it renders label', function(assert) {
  this.set('column', new Column({ label: 'translatable-table-column' }));

  this.render(hbs`{{light-table/columns/translatable-table-column column}}`);

  assert.equal(this.$().text().trim(), 'translatable-table-column');
});
