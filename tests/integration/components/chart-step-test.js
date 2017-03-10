import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-step', 'Integration | Component | chart step', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-step}}`);
  assert.equal(this.$().text().trim(), '');
});
