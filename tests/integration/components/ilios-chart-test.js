import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ilios-chart', 'Integration | Component | ilios chart', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{ilios-chart name='donut'}}`);

  assert.equal(this.$().text().trim(), '');
});
