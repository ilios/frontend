import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('connection-status', 'Integration | Component | connection status', {
  integration: true
});

test('it renders offline and therefor hidden', function(assert) {
  this.render(hbs`{{connection-status}}`);
  assert.notOk(this.$().hasClass('offline'));
});
