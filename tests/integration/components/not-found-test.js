import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('not-found', 'Integration | Component | not found', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{not-found}}`);

  assert.equal(this.$().text().trim(), "Rats! I couldn't find that. Please check your page address, and try again.\n  Back to Dashboard");
});
