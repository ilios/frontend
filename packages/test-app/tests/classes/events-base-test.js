import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DateTime } from 'luxon';
import EventsBase from 'ilios-common/classes/events-base';
module('Unit | Services | events-base', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    // EventsBase is declared in a non-standard location (i.e. not in a `/services` subdirectory).
    // So it doesn't get automatically registered as service here.
    this.owner.register('service:events-base', EventsBase);
    this.eventsBase = this.owner.lookup('service:events-base');
  });

  // See issue ilios/ilios#6631 for reference.
  test.each(
    'createEventFromData() - end-of-day events based on ILMs',
    [
      ['2025-11-10T09:45:00', '2025-11-10T10:00:00', '2025-11-10T09:45:00', '2025-11-10T10:00:00'],
      // these are edge-cases for ILM-based events.
      // If the event starts at 11:45p or later in the given day,
      // then pin the calendar start- and end-date to 11:45p and 11:59p of that day.
      ['2025-11-10T23:45:00', '2025-11-11T00:00:00', '2025-11-10T23:45:00', '2025-11-10T23:59:00'],
      ['2025-11-10T23:50:00', '2026-11-11T00:05:00', '2025-11-10T23:45:00', '2025-11-10T23:59:00'],
      ['2025-11-10T23:59:00', '2026-11-11T00:14:00', '2025-11-10T23:45:00', '2025-11-10T23:59:00'],
    ],
    async function (
      assert,
      [startDate, endDate, expectedCalendarStartDate, expectedCalendarEndDate],
    ) {
      let event = this.eventsBase.createEventFromData(
        {
          ilmSession: 111,
          startDate: startDate,
          endDate: endDate,
          prerequisites: [],
          postrequisites: [],
        },
        true,
      );
      assert.strictEqual(event.startDate, startDate);
      assert.strictEqual(event.endDate, endDate);
      assert.strictEqual(
        DateTime.fromISO(event.calendarStartDate).toISO(),
        DateTime.fromISO(expectedCalendarStartDate).toISO(),
      );
      assert.strictEqual(
        DateTime.fromISO(event.calendarEndDate).toISO(),
        DateTime.fromISO(expectedCalendarEndDate).toISO(),
      );
    },
  );
});
