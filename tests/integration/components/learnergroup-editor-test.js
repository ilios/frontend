import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learnergroup-editor', 'Integration | Component | learnergroup editor', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learnergroup-editor}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#learnergroup-editor}}
      template block text
    {{/learnergroup-editor}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
