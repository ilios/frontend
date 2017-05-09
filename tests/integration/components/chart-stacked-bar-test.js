import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-stacked-bar', 'Integration | Component | chart stacked bar', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-stacked-bar}}`);
  assert.equal(this.$().text().trim(), '');
});
