import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('global-search', 'Integration | Component | global search', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  this.render(hbs`{{global-search}}`);

  assert.equal(this.$().text().trim(), '');
});
