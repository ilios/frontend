import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const { RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('ilios-calendar', 'Integration | Component | ilios calendar', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);
  let events = resolve([]);
  this.set('events', events);
  let date = new Date('2015-09-30T12:00:00');
  this.set('date', date);
  this.set('nothing', parseInt);

  this.render(hbs`{{ilios-calendar
    selectedDate=date
    selectedView='day'
    calendarEventsPromise=events
    changeDate=(action nothing)
    changeView=(action nothing)
    selectEvent=(action nothing)
  }}`);

  assert.ok(this.$().text().trim().search(/Wednesday, September 30th 2015/) !== -1);
});
