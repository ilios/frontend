import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pulse-loader', 'Integration | Component | pulse loader', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{pulse-loader}}`);
  assert.equal(this.$().text().trim(), '');
});
