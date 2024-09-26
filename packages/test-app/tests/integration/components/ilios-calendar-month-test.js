import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-month';

module('Integration | Component | ilios calendar month', function (hooks) {
  setupRenderingTest(hooks);

  test('month displays with three events', async function (assert) {
    const date = DateTime.fromISO('2015-09-30T12:00:00');
    this.set('date', date.toJSDate());
    const firstEvent = createUserEventObject();
    firstEvent.name = 'Some new thing';
    firstEvent.startDate = date.toISO();
    firstEvent.endDate = date.plus({ hour: 1 }).toISO();
    const secondEvent = createUserEventObject();
    secondEvent.name = 'Second new thing';
    secondEvent.startDate = date.plus({ hour: 1 }).toISO();
    secondEvent.endDate = date.plus({ hour: 3 }).toISO();
    const thirdEvent = createUserEventObject();
    thirdEvent.name = 'Third new thing';
    thirdEvent.startDate = date.plus({ hour: 3 }).toISO();
    thirdEvent.endDate = date.plus({ hour: 4 }).toISO();
    this.set('events', [firstEvent, secondEvent, thirdEvent]);
    await render(hbs`<IliosCalendarMonth @date={{this.date}} @calendarEvents={{this.events}} @selectEvent={{(noop)}} />`);
    assert.strictEqual(component.calendar.title, 'September 2015');
    assert.strictEqual(component.calendar.events.length, 2);
    assert.ok(component.calendar.days[29].hasShowMore);
  });

  test('month displays with two events', async function (assert) {
    const date = DateTime.fromISO('2015-09-30T12:00:00');
    this.set('date', date.toJSDate());
    const firstEvent = createUserEventObject();
    firstEvent.name = 'Some new thing';
    firstEvent.startDate = date.toISO();
    firstEvent.endDate = date.plus({ hour: 1 }).toISO();
    const secondEvent = createUserEventObject();
    secondEvent.name = 'Second new thing';
    secondEvent.startDate = date.plus({ hour: 1 }).toISO();
    secondEvent.endDate = date.plus({ hour: 3 }).toISO();
    this.set('events', [firstEvent, secondEvent]);
    await render(hbs`<IliosCalendarMonth @date={{this.date}} @calendarEvents={{this.events}} @selectEvent={{(noop)}} />`);
    assert.strictEqual(component.calendar.title, 'September 2015');
    assert.strictEqual(component.calendar.events.length, 2);
    assert.notOk(component.calendar.days[29].hasShowMore);
  });

  test('clicking on a day fires the correct event', async function (assert) {
    assert.expect(2);
    const date = DateTime.fromISO('2015-09-30T12:00:00');
    this.set('date', date.toJSDate());
    this.set('changeDate', (newDate) => {
      assert.strictEqual(newDate, '2015-09-01');
    });
    this.set('changeView', (newView) => {
      assert.strictEqual(newView, 'day');
    });
    await render(hbs`<IliosCalendarMonth
  @date={{this.date}}
  @changeDate={{this.changeDate}}
  @changeView={{this.changeView}}
  @calendarEvents={{(array)}}
  @areDaysSelectable={{true}}
/>`);
    await component.calendar.days[0].selectDay();
  });

  const createUserEventObject = function () {
    return {
      user: 1,
      name: '',
      offering: 1,
      startDate: null,
      endDate: null,
      calendarColor: '#32edfc',
      location: 'Rm. 160',
      lastModified: new Date(),
      isPublished: true,
      isScheduled: false,
      prerequisites: [],
      postrequisites: [],
    };
  };

  test('multiday events', async function (assert) {
    const date = DateTime.fromISO('2015-09-20T12:00:00');
    const event = createUserEventObject();
    event.startDate = date.toISO();
    event.endDate = date.plus({ hour: 24 }).toISO();
    const event2 = createUserEventObject();
    event2.startDate = date.plus({ hour: 48 }).toISO();
    event2.endDate = date.plus({ hour: 72 }).toISO();
    this.set('date', date.toJSDate());
    this.set('events', [event, event2]);
    await render(hbs`<IliosCalendarMonth @date={{this.date}} @calendarEvents={{this.events}} @selectEvent={{(noop)}} />`);
    assert.strictEqual(component.multiday.events.length, 2);
    assert.strictEqual(
      component.multiday.events[0].text,
      '09/20/15, 12:00 PM – 09/21/15, 12:00 PM Rm. 160',
    );
    assert.strictEqual(
      component.multiday.events[1].text,
      '09/22/15, 12:00 PM – 09/23/15, 12:00 PM Rm. 160',
    );
  });
});
