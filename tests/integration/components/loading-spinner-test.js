import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('Integration | Component | loading-spinner', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{loading-spinner}}`);

  assert.equal(this.$().text().trim(), '');
  assert.ok(this.$('i').hasClass('fa-spinner'));
});
