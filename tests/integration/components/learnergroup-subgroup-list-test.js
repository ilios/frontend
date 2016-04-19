import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learnergroup-subgroup-list', 'Integration | Component | learnergroup subgroup list', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{learnergroup-subgroup-list}}`);

  assert.equal(this.$().text().trim(), '');
});
