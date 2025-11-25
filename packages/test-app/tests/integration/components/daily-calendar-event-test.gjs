import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/daily-calendar-event';
import DailyCalendarEvent from 'ilios-common/components/daily-calendar-event';
import Event from 'ilios-common/classes/event';
import { array } from '@ember/helper';

module('Integration | Component | daily-calendar-event', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  this.createEvent = function (
    name,
    startDate,
    endDate,
    lastModified,
    isScheduled,
    isPublished,
    prerequisites,
  ) {
    prerequisites = prerequisites ?? [];
    return new Event(
      {
        name,
        startDate,
        endDate,
        color: '#00cc65',
        lastModified,
        isPublished,
        isScheduled,
        prerequisites,
        postrequisites: [],
      },
      true,
    );
  };

  this.getStyle = function (rowStart, minutes, columnSpan) {
    return {
      'background-color': 'rgb(0, 204, 101)',
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
      'grid-row-start': `${rowStart}`,
      'grid-row-end': `span ${minutes}`,
      'grid-column-start': `span ${columnSpan}`,
    };
  };

  module('A complicated event list', function (hooks) {
    hooks.beforeEach(function () {
      this.events = [
        this.createEvent(
          'event 0',
          '2019-01-09T08:00:00',
          '2019-01-09T09:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 1',
          '2019-01-09T08:00:00',
          '2019-01-09T11:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 2',
          '2019-01-09T08:10:00',
          '2019-01-09T10:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 3',
          '2019-01-09T10:00:00',
          '2019-01-09T12:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 4',
          '2019-01-09T10:10:00',
          '2019-01-09T12:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 5',
          '2019-01-09T12:00:00',
          '2019-01-09T13:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
      ];
    });

    test('it renders alone', async function (assert) {
      this.set('event', this.events[0]);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{array this.event}} />
        </template>,
      );
      const styles = this.getStyle(97, 12, 50);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 0');
      assert.strictEqual(component.time, '08:00 AM');
    });

    test('check event 0', async function (assert) {
      this.set('event', this.events[0]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(97, 12, 16);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 0');
      assert.strictEqual(component.time, '08:00 AM');
    });

    test('check event 1', async function (assert) {
      this.set('event', this.events[1]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(97, 42, 16);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 1');
      assert.strictEqual(component.time, '08:00 AM');
    });

    test('check event 2', async function (assert) {
      this.set('event', this.events[2]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(99, 22, 16);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 2');
      assert.strictEqual(component.time, '08:10 AM');
    });

    test('check event 3', async function (assert) {
      this.set('event', this.events[3]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(121, 24, 16);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 3');
      assert.strictEqual(component.time, '10:00 AM');
    });

    test('check event 4', async function (assert) {
      this.set('event', this.events[4]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(123, 22, 16);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 4');
      assert.strictEqual(component.time, '10:10 AM');
    });

    test('check event 5', async function (assert) {
      this.set('event', this.events[5]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(145, 12, 50);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 5');
      assert.strictEqual(component.time, '12:00 PM');
    });
  });

  module('Second complicated event list', function (hooks) {
    hooks.beforeEach(function () {
      this.events = [
        this.createEvent(
          'event 0',
          '2020-02-10T08:10:00',
          '2020-02-10T10:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 1',
          '2020-02-10T08:10:00',
          '2020-02-10T09:20:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 2',
          '2020-02-10T09:40:00',
          '2020-02-10T10:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 3',
          '2020-02-10T10:10:00',
          '2020-02-10T12:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 4',
          '2020-02-10T10:40:00',
          '2020-02-10T12:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 5',
          '2020-02-10T10:40:00',
          '2020-02-10T12:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 6',
          '2020-02-10T10:40:00',
          '2020-02-10T12:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 7',
          '2020-02-10T10:40:00',
          '2020-02-10T12:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 8',
          '2020-02-10T10:40:00',
          '2020-02-10T12:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 9',
          '2020-02-10T10:40:00',
          '2020-02-10T12:30:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
        this.createEvent(
          'event 10',
          '2020-02-10T12:00:00',
          '2020-02-10T13:00:00',
          '2012-01-09T08:00:00',
          false,
          true,
        ),
      ];
    });

    test('check event 0', async function (assert) {
      this.set('event', this.events[0]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(99, 22, 25);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 0');
      assert.strictEqual(component.time, '08:10 AM');
    });

    test('check event 1', async function (assert) {
      this.set('event', this.events[1]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(99, 14, 25);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 1');
      assert.strictEqual(component.time, '08:10 AM');
    });

    test('check event 2', async function (assert) {
      this.set('event', this.events[2]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(117, 10, 25);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 2');
      assert.strictEqual(component.time, '09:40 AM');
    });

    test('check event 3', async function (assert) {
      this.set('event', this.events[3]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(123, 22, 7);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 3');
      assert.strictEqual(component.time, '10:10 AM');
    });

    test('check event 4', async function (assert) {
      this.set('event', this.events[4]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(129, 22, 6);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 4');
      assert.strictEqual(component.time, '10:40 AM');
    });

    test('check event 5', async function (assert) {
      this.set('event', this.events[5]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(129, 22, 6);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 5');
      assert.strictEqual(component.time, '10:40 AM');
    });

    test('check event 6', async function (assert) {
      this.set('event', this.events[6]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(129, 22, 6);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 6');
      assert.strictEqual(component.time, '10:40 AM');
    });

    test('check event 7', async function (assert) {
      this.set('event', this.events[7]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(129, 22, 6);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 7');
      assert.strictEqual(component.time, '10:40 AM');
    });

    test('check event 8', async function (assert) {
      this.set('event', this.events[8]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(129, 22, 6);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 8');
      assert.strictEqual(component.time, '10:40 AM');
    });

    test('check event 9', async function (assert) {
      this.set('event', this.events[9]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(129, 22, 6);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 9');
      assert.strictEqual(component.time, '10:40 AM');
    });

    test('check event 10', async function (assert) {
      this.set('event', this.events[10]);
      this.set('events', this.events);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      const styles = this.getStyle(145, 12, 7);
      assert.ok(component.style.includes(styles['grid-row-start']));
      assert.ok(component.style.includes(styles['grid-row-end']));
      assert.ok(component.style.includes(styles['grid-column-start']));
      assert.strictEqual(component.name, 'event 10');
      assert.strictEqual(component.time, '12:00 PM');
    });
  });

  module('iconography', function () {
    test('recently updated', async function (assert) {
      const event = this.createEvent(
        'event 0',
        '2020-02-10T10:40:00',
        '2020-02-10T12:30:00',
        DateTime.now().toISO(),
        false,
        true,
      );
      this.set('event', event);
      this.set('events', [event]);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      assert.ok(component.wasRecentlyUpdated);
    });

    test('not recently updated', async function (assert) {
      const event = this.createEvent(
        'event 0',
        '2020-02-10T10:40:00',
        '2020-02-10T12:30:00',
        '2012-01-09T08:00:00',
        false,
        true,
      );
      this.set('event', event);
      this.set('events', [event]);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      assert.notOk(component.wasRecentlyUpdated);
    });

    test('scheduled', async function (assert) {
      const event = this.createEvent(
        'event 0',
        '2020-02-10T10:40:00',
        '2020-02-10T12:30:00',
        '2012-01-09T08:00:00',
        true,
        true,
      );
      this.set('event', event);
      this.set('events', [event]);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      assert.ok(component.isScheduled);
    });

    test('draft', async function (assert) {
      const event = this.createEvent(
        'event 0',
        '2020-02-10T10:40:00',
        '2020-02-10T12:30:00',
        '2012-01-09T08:00:00',
        true,
        false,
      );
      this.set('event', event);
      this.set('events', [event]);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      assert.ok(component.isDraft);
    });

    test('prework', async function (assert) {
      const event = this.createEvent(
        'event 0',
        '2020-02-10T10:40:00',
        '2020-02-10T12:30:00',
        '2012-01-09T08:00:00',
        true,
        false,
        [
          {
            name: 'prework',
            startDate: '2020-02-08T23:45:00',
            endDate: '2020-02-09T00:00:00',
            postrequisites: [],
            prerequisites: [],
          },
        ],
      );
      this.set('event', event);
      this.set('events', [event]);
      await render(
        <template>
          <DailyCalendarEvent @event={{this.event}} @allDayEvents={{this.events}} />
        </template>,
      );
      assert.ok(component.preworkIndicator.isPresent);
      assert.strictEqual(component.preworkIndicator.title, 'Has pre-work');
    });
  });
});
