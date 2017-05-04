import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-horz-bar', 'Integration | Component | chart horz-bar', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-horz-bar}}`);
  assert.equal(this.$().text().trim(), '');
});
