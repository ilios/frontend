import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-donut', 'Integration | Component | chart donut', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-donut}}`);
  assert.equal(this.$().text().trim(), '');
});
