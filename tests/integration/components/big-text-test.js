import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('big-text', 'Integration | Component | big text', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{big-text}}`);
  assert.equal(this.$().text().trim(), '');
});
