import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('selectable-terms-list', 'Integration | Component | selectable terms list', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{selectable-terms-list}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#selectable-terms-list}}
      template block text
    {{/selectable-terms-list}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
