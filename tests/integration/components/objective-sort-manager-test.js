import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('objective-sort-manager', 'Integration | Component | objective sort manager', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{objective-sort-manager}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#objective-sort-manager}}
      template block text
    {{/objective-sort-manager}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
