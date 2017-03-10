import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-spline', 'Integration | Component | chart spline', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-spline}}`);
  assert.equal(this.$().text().trim(), '');
});
