import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('pagedlist-controls', 'Integration | Component | pagedlist controls', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });" + EOL + EOL +

  this.render(hbs`{{pagedlist-controls limit=4 offset=11 total=33}}`);

  assert.equal(this.$().text().replace(/[\t\n\s]+/g, ""), 'Showing12-15of33102550PerPage');
});
