import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('session-table-title', 'Integration | Component | session table title', {
  integration: true
});

test('it renders with a link', function(assert) {
  const i = 'i';
  this.render(hbs`{{session-table-title value='test'}}`);

  assert.equal(this.$().text().trim(), 'test');
  assert.ok(this.$(i).hasClass('fa-external-link-square'));
});
