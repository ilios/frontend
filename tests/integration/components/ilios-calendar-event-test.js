import { moduleForComponent, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ilios-calendar-event', 'Integration | Component | ilios calendar event', {
  integration: true
});

//@todo needs some real tests JJ 6/2017
skip('it renders', function(assert) {
  this.render(hbs`{{ilios-calendar-event}}`);

  assert.equal(this.$().text().trim(), '');
});

skip('it calculates recentlyUpdated correctly', function(assert) {
  this.render(hbs`{{ilios-calendar-event}}`);

  assert.equal(this.$().text().trim(), '');
});
