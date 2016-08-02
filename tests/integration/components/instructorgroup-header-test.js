import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('instructorgroup-header', 'Integration | Component | instructorgroup header', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{instructorgroup-header}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#instructorgroup-header}}
      template block text
    {{/instructorgroup-header}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
