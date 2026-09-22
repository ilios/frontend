import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-month';
import IliosCalendarMonth from 'ilios-common/components/ilios-calendar-month';
import Event from 'ilios-common/classes/event';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | ilios calendar month', function (hooks) {
  setupRenderingTest(hooks);

  test('month displays with three events', async function (assert) {
    const date = DateTime.fromISO('2015-09-30T12:00:00');
    this.set('date', date.toJSDate());
    const firstEvent = createUserEventObject(
      'Some new thing',
      date.toISO(),
      date.plus({ hour: 1 }).toISO(),
    );
    const secondEvent = createUserEventObject(
      'Second new thing',
      date.plus({ hour: 1 }).toISO(),
      date.plus({ hour: 3 }).toISO(),
    );
    const thirdEvent = createUserEventObject(
      'Third new thing',
      date.plus({ hour: 3 }).toISO(),
      date.plus({ hour: 4 }).toISO(),
    );
    this.set('events', [firstEvent, secondEvent, thirdEvent]);
    await render(
      <template>
        <IliosCalendarMonth
          @date={{this.date}}
          @calendarEvents={{this.events}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.calendar.title, 'September 2015');
    assert.strictEqual(component.calendar.events.length, 2);
    assert.ok(component.calendar.days[29].hasShowMore);
  });

  test('month displays with two events', async function (assert) {
    const date = DateTime.fromISO('2015-09-30T12:00:00');
    this.set('date', date.toJSDate());
    const firstEvent = createUserEventObject(
      'Some new thing',
      date.toISO(),
      date.plus({ hour: 1 }).toISO(),
    );
    const secondEvent = createUserEventObject(
      'Second new thing',
      date.plus({ hour: 1 }).toISO(),
      date.plus({ hour: 3 }).toISO(),
    );
    this.set('events', [firstEvent, secondEvent]);
    await render(
      <template>
        <IliosCalendarMonth
          @date={{this.date}}
          @calendarEvents={{this.events}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.calendar.title, 'September 2015');
    assert.strictEqual(component.calendar.events.length, 2);
    assert.notOk(component.calendar.days[29].hasShowMore);
  });

  test('clicking on a day fires the correct event', async function (assert) {
    const date = DateTime.fromISO('2015-09-30T12:00:00');
    this.set('date', date.toJSDate());
    this.set('changeDate', (newDate) => {
      assert.step('changeDate called');
      assert.strictEqual(newDate, '2015-09-01');
    });
    this.set('changeView', (newView) => {
      assert.step('changeView called');
      assert.strictEqual(newView, 'day');
    });
    await render(
      <template>
        <IliosCalendarMonth
          @date={{this.date}}
          @changeDate={{this.changeDate}}
          @changeView={{this.changeView}}
          @calendarEvents={{(array)}}
          @areDaysSelectable={{true}}
        />
      </template>,
    );
    await component.calendar.days[0].selectDay();
    assert.verifySteps(['changeDate called', 'changeView called']);
  });

  const createUserEventObject = function (name, startDate, endDate) {
    return new Event(
      {
        user: 1,
        name,
        offering: 1,
        startDate,
        endDate,
        calendarColor: '#32edfc',
        location: 'Rm. 160',
        lastModified: new Date(),
        isPublished: true,
        isScheduled: false,
        prerequisites: [],
        postrequisites: [],
      },
      true,
    );
  };

  test('multiday events', async function (assert) {
    const date = DateTime.fromISO('2015-09-20T12:00:00');
    const event = createUserEventObject('event 0', date.toISO(), date.plus({ hour: 24 }).toISO());
    const event2 = createUserEventObject(
      'event 1',
      date.plus({ hour: 48 }).toISO(),
      date.plus({ hour: 72 }).toISO(),
    );
    this.set('date', date.toJSDate());
    this.set('events', [event, event2]);
    await render(
      <template>
        <IliosCalendarMonth
          @date={{this.date}}
          @calendarEvents={{this.events}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.multiday.events.length, 2);
    assert.strictEqual(
      component.multiday.events[0].text,
      '09/20/15, 12:00 PM – 09/21/15, 12:00 PM event 0 Rm. 160',
    );
    assert.strictEqual(
      component.multiday.events[1].text,
      '09/22/15, 12:00 PM – 09/23/15, 12:00 PM event 1 Rm. 160',
    );
  });
});
