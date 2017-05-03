import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('chart-bar-horz', 'Integration | Component | chart bar-horz', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{chart-bar-horz}}`);
  assert.equal(this.$().text().trim(), '');
});
