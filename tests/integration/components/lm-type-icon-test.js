import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('lm-type-icon', 'Integration | Component | lm type icon', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{lm-type-icon}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#lm-type-icon}}
      template block text
    {{/lm-type-icon}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
