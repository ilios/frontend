import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-pie', 'Integration | Component | chart pie', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-pie}}`);
  assert.equal(this.$().text().trim(), '');
});
