import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('new-curriculum-inventory-sequence-block', 'Integration | Component | new curriculum inventory sequence block', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{new-curriculum-inventory-sequence-block}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#new-curriculum-inventory-sequence-block}}
      template block text
    {{/new-curriculum-inventory-sequence-block}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
