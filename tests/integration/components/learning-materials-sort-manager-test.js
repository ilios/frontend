import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learning-materials-sort-manager', 'Integration | Component | learning materials sort manager', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learning-materials-sort-manager}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#learning-materials-sort-manager}}
      template block text
    {{/learning-materials-sort-manager}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
