import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learnergroup-cohort-user-manager', 'Integration | Component | learnergroup cohort user manager', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learnergroup-cohort-user-manager}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#learnergroup-cohort-user-manager}}
      template block text
    {{/learnergroup-cohort-user-manager}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
