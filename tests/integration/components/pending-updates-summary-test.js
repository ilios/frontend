import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pending-updates-summary', 'Integration | Component | pending updates summary', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{pending-updates-summary}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#pending-updates-summary}}
      template block text
    {{/pending-updates-summary}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
