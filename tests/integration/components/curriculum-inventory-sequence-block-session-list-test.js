import { moduleForComponent, test } from 'ember-qunit';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('curriculum-inventory-sequence-block-session-list', 'Integration | Component | curriculum inventory sequence block session list', {
  integration: true
});

skip('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{curriculum-inventory-sequence-block-session-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#curriculum-inventory-sequence-block-session-list}}
      template block text
    {{/curriculum-inventory-sequence-block-session-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
