import { moduleForComponent, test } from 'ember-qunit';
import moment from 'moment';
import hbs from 'htmlbars-inline-precompile';

let getEvent = function(){
  return {
    startDate: moment('1984-11-11').toDate(),
    endDate: moment('1984-11-12').toDate(),
    name: "Cheramie is born",
    location: 'Lancaster, CA',
  };
};

moduleForComponent('ilios-calendar-multiday-event', 'Integration | Component | ilios calendar multiday event', {
  integration: true
});

test('event displays correctly', function(assert) {
  assert.expect(4);
  let event = getEvent();
  this.set('event', event);
  this.set('nothing', parseInt);
  this.render(hbs`{{ilios-calendar-multiday-event event=event selectEvent=(action nothing)}}`);

  assert.equal(this.$().text().search(/11\/11\/84/), 0);
  assert.equal(this.$().text().search(/11\/12\/84/), 19);
  assert.equal(this.$().text().search(/Cheramie is born/), 39);
  assert.equal(this.$().text().search(/Lancaster, CA/), 57);

});

test('action fires on click', function(assert) {
  assert.expect(2);
  let event = getEvent();
  event.offering = 1;

  this.set('event', event);
  this.set('selectEvent', (value) => {
    assert.deepEqual(event, value);
  });
  this.render(hbs`{{ilios-calendar-multiday-event event=event selectEvent=selectEvent}}`);
  assert.ok(this.$().text().search(/Cheramie is born/) > 0);

  this.$('.clickable').click();
});

test('action does not fire for scheduled events', function(assert) {
  let event = getEvent();

  this.set('event', event);
  assert.expect(1);
  this.on('handleAction', () => {
    //this should never get called
    assert.ok(false);
  });
  this.render(hbs`{{ilios-calendar-multiday-event event=event selectEvent=(action 'handleAction')}}`);
  assert.ok(this.$().text().search(/Cheramie is born/) > 0);


  this.$('.clickable').click();
});

test('action does not fire for unslecatbleEvents events', function(assert) {
  let event = getEvent();
  event.offering = 1;

  this.set('event', event);
  assert.expect(1);
  this.on('handleAction', () => {
    //this should never get called
    assert.ok(false);
  });
  this.render(hbs`{{ilios-calendar-multiday-event event=event isEventSelectable=false selectEvent=(action 'handleAction')}}`);
  assert.ok(this.$().text().search(/Cheramie is born/) > 0);


  this.$('.clickable').click();
});
