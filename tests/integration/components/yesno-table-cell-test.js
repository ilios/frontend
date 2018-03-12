import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('yesno-table-cell', 'Integration | Component | yesno table cell', {
  integration: true
});

test('it renders yes', function (assert) {
  this.render(hbs`{{yesno-table-cell value=true}}`);
  assert.equal(this.$().text().trim(), 'Yes');
  assert.ok(this.$('div').hasClass('yes'));
});

test('it renders no', function (assert) {
  this.render(hbs`{{yesno-table-cell value=false}}`);
  assert.equal(this.$().text().trim(), 'No');
  assert.ok(this.$('div').hasClass('no'));
});
