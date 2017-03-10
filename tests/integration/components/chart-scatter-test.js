import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-scatter', 'Integration | Component | chart scatter', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-scatter}}`);
  assert.equal(this.$().text().trim(), '');
});
