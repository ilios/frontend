import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-bar', 'Integration | Component | chart bar', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-bar}}`);
  assert.equal(this.$().text().trim(), '');
});
