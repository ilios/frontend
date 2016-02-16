import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('detail-taxonomies', 'Integration | Component | detail taxonomies', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  this.render(hbs`{{detail-taxonomies}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:"
  this.render(hbs`
    {{#detail-taxonomies}}
      template block text
    {{/detail-taxonomies}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
