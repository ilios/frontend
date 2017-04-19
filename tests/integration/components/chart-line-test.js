import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-line', 'Integration | Component | chart bar', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-line}}`);
  assert.equal(this.$().text().trim(), '');
});
