import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learnergroup-instructor-manager', 'Integration | Component | learnergroup instructor manager', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learnergroup-instructor-manager}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#learnergroup-instructor-manager}}
      template block text
    {{/learnergroup-instructor-manager}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
