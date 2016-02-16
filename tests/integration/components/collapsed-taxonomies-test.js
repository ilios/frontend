import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('collapsed-taxonomies', 'Integration | Component | collapsed taxonomies', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{collapsed-taxonomies}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#collapsed-taxonomies}}
      template block text
    {{/collapsed-taxonomies}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
