import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { Column } from 'ember-light-table';

moduleForComponent('light-table/columns/translatable-table-column', 'Integration | Component | Columns | translatable-table-column', {
  integration: true
});

test('it renders label', function(assert) {
  this.set('column', new Column({ labelKey: 'general.thursday' }));

  this.render(hbs`{{light-table/columns/translatable-table-column column}}`);

  assert.equal(this.$().text().trim(), 'Thursday');
});
