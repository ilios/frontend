import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | ilios calendar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
    let events = resolve([]);
    this.set('events', events);
    let date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('nothing', parseInt);

    await render(hbs`{{ilios-calendar
      selectedDate=date
      selectedView='day'
      calendarEventsPromise=events
      changeDate=(action nothing)
      changeView=(action nothing)
      selectEvent=(action nothing)
    }}`);

    assert.ok(this.element.textContent.trim().search(/Wednesday, September 30th 2015/) !== -1);
  });
});
