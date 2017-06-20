import { moduleForComponent, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('toggle-wide', 'Integration | Component | toggle wide', {
  integration: true
});

skip('it renders', function(assert) {
  this.render(hbs`{{toggle-wide}}`);
  assert.equal(this.$().text().trim(), '');
});
