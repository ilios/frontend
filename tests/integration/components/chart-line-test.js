import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-line', 'Integration | Component | chart line', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-line}}`);
  assert.equal(this.$().text().trim(), '0.00.20.40.60.81.01.21.41.61.82.0');
});
