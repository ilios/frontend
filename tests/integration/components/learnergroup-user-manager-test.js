import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learnergroup-user-manager', 'Integration | Component | learnergroup user manager', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learnergroup-user-manager}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#learnergroup-user-manager}}
      template block text
    {{/learnergroup-user-manager}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
