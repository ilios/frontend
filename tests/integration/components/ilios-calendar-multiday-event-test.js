import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
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

module('Integration | Component | ilios calendar multiday event', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('event displays correctly', async function(assert) {
    assert.expect(4);
    let event = getEvent();
    this.set('event', event);
    this.set('nothing', parseInt);
    await render(hbs`{{ilios-calendar-multiday-event event=event selectEvent=(action nothing)}}`);

    assert.equal(this.element.textContent.search(/11\/11\/84/), 0);
    assert.equal(this.element.textContent.search(/11\/12\/84/), 19);
    assert.equal(this.element.textContent.search(/Cheramie is born/), 39);
    assert.equal(this.element.textContent.search(/Lancaster, CA/), 57);

  });

  test('action fires on click', async function(assert) {
    assert.expect(2);
    let event = getEvent();
    event.offering = 1;

    this.set('event', event);
    this.set('selectEvent', (value) => {
      assert.deepEqual(event, value);
    });
    await render(hbs`{{ilios-calendar-multiday-event event=event selectEvent=selectEvent}}`);
    assert.ok(this.element.textContent.search(/Cheramie is born/) > 0);

    await click('[data-test-event-name]');
  });

  test('action does not fire for scheduled events', async function(assert) {
    let event = getEvent();

    this.set('event', event);
    assert.expect(1);
    this.actions.handleAction = () => {
      //this should never get called
      assert.ok(false);
    };
    await render(hbs`{{ilios-calendar-multiday-event event=event selectEvent=(action 'handleAction')}}`);
    assert.ok(this.element.textContent.search(/Cheramie is born/) > 0);

    await click('[data-test-event-name]');
  });

  test('action does not fire for unslecatbleEvents events', async function(assert) {
    let event = getEvent();
    event.offering = 1;

    this.set('event', event);
    assert.expect(1);
    this.actions.handleAction = () => {
      //this should never get called
      assert.ok(false);
    };
    await render(
      hbs`{{ilios-calendar-multiday-event event=event isEventSelectable=false selectEvent=(action 'handleAction')}}`
    );
    assert.ok(this.element.textContent.search(/Cheramie is born/) > 0);


    await click('[data-test-event-name]');
  });
});
