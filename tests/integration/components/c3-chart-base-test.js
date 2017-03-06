import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('c3-chart-base', 'Integration | Component | c3 chart base', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{c3-chart-base}}`);
  assert.equal(this.$().text().trim(), '');
});
