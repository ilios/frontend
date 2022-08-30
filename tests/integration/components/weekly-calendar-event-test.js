import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
const s = '[data-test-weekly-calendar-event]';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | weekly-calendar-event', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  this.createEvent = function (startDate, endDate) {
    const lastModified = '2012-01-09 08:00:00';
    const color = '#00cc65';

    this.server.create('userevent', {
      startDate,
      endDate,
      color,
      lastModified,
    });
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
      this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00');
      this.createEvent('2019-01-09 08:00:00', '2019-01-09 11:30:00');
      this.createEvent('2019-01-09 08:10:00', '2019-01-09 10:00:00');
      this.createEvent('2019-01-09 10:00:00', '2019-01-09 12:00:00');
      this.createEvent('2019-01-09 10:10:00', '2019-01-09 12:00:00');
      this.createEvent('2019-01-09 12:00:00', '2019-01-09 13:00:00');
      this.events = this.server.db.userevents;
    });

    test('it renders alone', async function (assert) {
      this.set('event', this.events[0]);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{array this.event}}
      />`);
      assert.dom(s).hasStyle(this.getStyle(97, 12, 50));
      assert.dom(s).hasText('8:00 AM event 0');
    });

    test('check event 0', async function (assert) {
      this.set('event', this.events[0]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(97, 12, 16));
      assert.dom(s).hasText('8:00 AM event 0');
    });

    test('check event 1', async function (assert) {
      this.set('event', this.events[1]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(97, 42, 16));
      assert.dom(s).hasText('8:00 AM event 1');
    });

    test('check event 2', async function (assert) {
      this.set('event', this.events[2]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(99, 22, 16));
      assert.dom(s).hasText('8:10 AM event 2');
    });

    test('check event 3', async function (assert) {
      this.set('event', this.events[3]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(121, 24, 16));
      assert.dom(s).hasText('10:00 AM event 3');
    });

    test('check event 4', async function (assert) {
      this.set('event', this.events[4]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(123, 22, 16));
      assert.dom(s).hasText('10:10 AM event 4');
    });

    test('check event 5', async function (assert) {
      this.set('event', this.events[5]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(145, 12, 50));
      assert.dom(s).hasText('12:00 PM event 5');
    });
  });

  module('Second complicated event list', function (hooks) {
    hooks.beforeEach(function () {
      this.createEvent('2020-02-10 08:10:00', '2020-02-10 10:00:00');
      this.createEvent('2020-02-10 08:10:00', '2020-02-10 09:20:00');
      this.createEvent('2020-02-10 09:40:00', '2020-02-10 10:30:00');
      this.createEvent('2020-02-10 10:10:00', '2020-02-10 12:00:00');
      this.createEvent('2020-02-10 10:40:00', '2020-02-10 12:30:00');
      this.createEvent('2020-02-10 10:40:00', '2020-02-10 12:30:00');
      this.createEvent('2020-02-10 10:40:00', '2020-02-10 12:30:00');
      this.createEvent('2020-02-10 10:40:00', '2020-02-10 12:30:00');
      this.createEvent('2020-02-10 10:40:00', '2020-02-10 12:30:00');
      this.createEvent('2020-02-10 10:40:00', '2020-02-10 12:30:00');
      this.createEvent('2020-02-10 12:00:00', '2020-02-10 13:00:00');
      this.events = this.server.db.userevents;
    });

    test('check event 0', async function (assert) {
      this.set('event', this.events[0]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(99, 22, 25));
      assert.dom(s).hasText('8:10 AM event 0');
    });

    test('check event 1', async function (assert) {
      this.set('event', this.events[1]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(99, 14, 25));
      assert.dom(s).hasText('8:10 AM event 1');
    });

    test('check event 2', async function (assert) {
      this.set('event', this.events[2]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(117, 10, 25));
      assert.dom(s).hasText('9:40 AM event 2');
    });

    test('check event 3', async function (assert) {
      this.set('event', this.events[3]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(123, 22, 7));
      assert.dom(s).hasText('10:10 AM event 3');
    });

    test('check event 4', async function (assert) {
      this.set('event', this.events[4]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(129, 22, 6));
      assert.dom(s).hasText('10:40 AM event 4');
    });

    test('check event 5', async function (assert) {
      this.set('event', this.events[5]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(129, 22, 6));
      assert.dom(s).hasText('10:40 AM event 5');
    });

    test('check event 6', async function (assert) {
      this.set('event', this.events[6]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(129, 22, 6));
      assert.dom(s).hasText('10:40 AM event 6');
    });

    test('check event 7', async function (assert) {
      this.set('event', this.events[7]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(129, 22, 6));
      assert.dom(s).hasText('10:40 AM event 7');
    });

    test('check event 8', async function (assert) {
      this.set('event', this.events[8]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(129, 22, 6));
      assert.dom(s).hasText('10:40 AM event 8');
    });

    test('check event 9', async function (assert) {
      this.set('event', this.events[9]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(129, 22, 6));
      assert.dom(s).hasText('10:40 AM event 9');
    });

    test('check event 10', async function (assert) {
      this.set('event', this.events[10]);
      this.set('events', this.events);
      await render(hbs`<WeeklyCalendarEvent
        @event={{this.event}}
        @allDayEvents={{this.events}}
      />`);

      assert.dom(s).hasStyle(this.getStyle(145, 12, 7));
      assert.dom(s).hasText('12:00 PM event 10');
    });
  });
});
