import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('back-link', 'Integration | Component | back link', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{back-link}}`);

  assert.equal(this.$().text().trim(), 'Back');
});
