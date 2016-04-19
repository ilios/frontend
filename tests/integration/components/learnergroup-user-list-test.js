import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learnergroup-user-list', 'Integration | Component | learnergroup user list', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learnergroup-user-list}}`);

  assert.equal(this.$().text().trim(), 'LIST OF USERS');
});
