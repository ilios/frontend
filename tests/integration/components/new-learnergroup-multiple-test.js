import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('new-learnergroup-multiple', 'Integration | Component | new learnergroup multiple', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{new-learnergroup-multiple}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#new-learnergroup-multiple}}
      template block text
    {{/new-learnergroup-multiple}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
