import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dashboard-loading', 'Integration | Component | dashboard loading', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{dashboard-loading}}`);

  assert.equal(this.$().text().trim(), '');
});
