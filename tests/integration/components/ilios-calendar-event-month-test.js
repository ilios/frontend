import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ilios-calendar-event-month', 'Integration | Component | ilios calendar event month', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{ilios-calendar-event-month}}`);

  assert.equal(this.$().text().trim(), '');
});
