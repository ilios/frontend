import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ilios-calendar-day', 'Integration | Component | ilios calendar day', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);
  let date = new Date('2015-09-30T12:00:00');
  this.set('date', date);
  this.set('nothing', parseInt);
  this.render(hbs`{{ilios-calendar-day date=date selectEvent=(action nothing)}}`);
  //Date input is Wednesday, Septrmber 30th.  Should be the first string
  assert.equal(this.$().text().trim().search(/^Wednesday/), 0);
  assert.equal(this.$('.event').length, 0);
});
