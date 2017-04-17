import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ilios-chart-tooltip', 'Integration | Component | ilios chart tooltip', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{ilios-chart-tooltip}}`);

  assert.equal(this.$().text().trim(), '');
});
