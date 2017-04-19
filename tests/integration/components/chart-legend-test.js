import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ilios-chart-legend', 'Integration | Component | ilios chart legend', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{ilios-chart-legend}}`);

  assert.equal(this.$().text().trim(), '');
});
