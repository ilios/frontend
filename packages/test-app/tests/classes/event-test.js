import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { DateTime } from 'luxon';
import Event from 'ilios-common/classes/event';

module('Unit | Classes | Event', function (hooks) {
  setupTest(hooks);
  test.each(
    'calendarStartDate',
    [
      ['2025-11-10T09:45:00', undefined, '2025-11-10T09:45:00'],
      ['2025-11-10T23:45:00', undefined, '2025-11-10T23:45:00'],
      ['2025-11-10T23:50:00', undefined, '2025-11-10T23:50:00'],
      ['2025-11-10T09:45:00', 1, '2025-11-10T09:45:00'],
      ['2025-11-10T23:45:00', 1, '2025-11-10T23:45:00'],
      // Edge-case scenario for ILM-based events.
      // If the given startDate is later than 11:45p, then pin the calendarStartDate to 11:45pm.
      // See issue ilios/ilios#6631 for reference.
      ['2025-11-10T23:50:00', 1, '2025-11-10T23:45:00'],
    ],
    async function (assert, [startDate, ilmSessionId, expectedCalendarStartDate]) {
      const event = new Event(
        {
          ilmSession: ilmSessionId,
          startDate: startDate,
          prerequisites: [],
          postrequisites: [],
        },
        true,
      );
      assert.strictEqual(
        DateTime.fromISO(event.calendarStartDate).toISO(),
        DateTime.fromISO(expectedCalendarStartDate).toISO(),
      );
    },
  );

  test.each(
    'calendarEndDate',
    [
      ['2025-11-10T09:45:00', undefined, undefined, '2025-11-10T09:45:00'],
      ['2025-11-10T23:45:00', undefined, undefined, '2025-11-10T23:45:00'],
      ['2025-11-10T23:50:00', undefined, undefined, '2025-11-10T23:50:00'],
      ['2025-11-10T09:45:00', undefined, 1, '2025-11-10T09:45:00'],
      // Edge-case scenario for ILM-based events.
      // If the given startDate is equal-to or later than 11:45p,
      // then pin the calendarEndDate to 11:59pm in the same day as the startDate.
      // See issue ilios/ilios#6631 for reference.
      ['2025-11-11T00:00:00', '2025-11-10T23:45:00', 1, '2025-11-10T23:59:00'],
      ['2025-11-11T00:14:00', '2025-11-10T23:59:00', 1, '2025-11-10T23:59:00'],
    ],
    async function (assert, [endDate, startDate, ilmSessionId, expectedCalendarEndDate]) {
      const event = new Event(
        {
          ilmSession: ilmSessionId,
          startDate,
          endDate,
          prerequisites: [],
          postrequisites: [],
        },
        true,
      );
      assert.strictEqual(
        DateTime.fromISO(event.calendarEndDate).toISO(),
        DateTime.fromISO(expectedCalendarEndDate).toISO(),
      );
    },
  );

  test.each(
    'isBlanked',
    [
      [undefined, undefined, true],
      [1, undefined, false],
      [undefined, 1, false],
      [1, 1, false],
    ],
    async function (assert, [offeringId, ilmSessionId, expectedIsBlanked]) {
      const event = new Event({
        offering: offeringId,
        ilmSession: ilmSessionId,
        postrequisites: [],
        prerequisites: [],
      });
      assert.strictEqual(event.isBlanked, expectedIsBlanked);
    },
  );

  test.each(
    'slug',
    [
      [true, '2025-11-10T09:45:00', 123, undefined, undefined, 'U20251110O123'],
      [true, '2025-11-10T09:45:00', undefined, 123, undefined, 'U20251110I123'],
      [false, '2025-11-10T09:45:00', 123, undefined, 4, 'S0420251110O123'],
      [false, '2025-11-10T09:45:00', undefined, 123, 4, 'S0420251110I123'],
      [false, '2025-11-10T09:45:00', 123, undefined, 10, 'S1020251110O123'],
      [false, '2025-11-10T09:45:00', undefined, 123, 10, 'S1020251110I123'],
    ],
    async function (
      assert,
      [isUserEvent, startDate, offeringId, ilmSessionId, schoolId, expectedSlug],
    ) {
      const event = new Event(
        {
          startDate,
          offering: offeringId,
          ilmSession: ilmSessionId,
          school: schoolId,
          postrequisites: [],
          prerequisites: [],
        },
        isUserEvent,
      );

      assert.strictEqual(event.slug, expectedSlug);
    },
  );

  test('prerequisites', async function (assert) {
    const data = {
      offering: 123,
      name: 'event 0',
      startDate: '2025-11-10T09:45:00',
      postrequisites: [],
      prerequisites: [
        {
          name: 'event 2',
          ilmSession: 123,
          startDate: '2025-11-09T00:00:00',
          postrequisites: [],
          prerequisites: [],
        },
        {
          name: 'event 1',
          ilmSession: 445,
          startDate: '2025-09-10T23:45:15',
          postrequisites: [],
          prerequisites: [],
        },
      ],
    };

    const event = new Event(data, true);
    assert.strictEqual(event.slug, 'U20251110O123');
    assert.strictEqual(event.prerequisites.length, 2);
    assert.ok(event.prerequisites[0] instanceof Event);
    assert.strictEqual(event.prerequisites[0].name, 'event 1');
    assert.strictEqual(event.prerequisites[0].slug, 'U20250910I445');
    assert.strictEqual(event.prerequisites[0].startDate, event.startDate);
    assert.ok(event.prerequisites[1] instanceof Event);
    assert.strictEqual(event.prerequisites[1].name, 'event 2');
    assert.strictEqual(event.prerequisites[1].slug, 'U20251109I123');
    assert.strictEqual(event.prerequisites[1].startDate, event.startDate);
  });

  test('postrequisites', async function (assert) {
    const data = {
      offering: 123,
      name: 'event 0',
      startDate: '2025-11-10T09:45:00',
      postrequisites: [
        {
          name: 'event 2',
          startDate: '2025-10-01T09:45:00',
          postrequisites: [],
          prerequisites: [],
        },
        {
          name: 'event 1',
          startDate: '2025-09-01T04:30:00',
          postrequisites: [],
          prerequisites: [],
        },
        {
          name: 'event 1',
          startDate: '2025-08-01T09:45:00',
          postrequisites: [],
          prerequisites: [],
        },
      ],
      prerequisites: [],
    };

    const event = new Event(data, true);
    assert.strictEqual(event.postrequisites.length, 3);
    assert.ok(event.postrequisites[0] instanceof Event);
    assert.strictEqual(event.postrequisites[0].name, 'event 1');
    assert.strictEqual(event.postrequisites[0].startDate, '2025-08-01T09:45:00');
    assert.ok(event.postrequisites[1] instanceof Event);
    assert.strictEqual(event.postrequisites[1].name, 'event 1');
    assert.strictEqual(event.postrequisites[1].startDate, '2025-09-01T04:30:00');
    assert.ok(event.postrequisites[2] instanceof Event);
    assert.strictEqual(event.postrequisites[2].name, 'event 2');
    assert.strictEqual(event.postrequisites[2].startDate, '2025-10-01T09:45:00');
  });

  test('hasPrework', async function (assert) {
    const event = new Event(
      {
        startDate: '2025-11-24T16:21:00',
        postrequisites: [],
        prerequisites: [],
      },
      true,
    );

    assert.notOk(event.hasPrework);

    event.prerequisites.push(
      new Event(
        {
          startDate: '2025-11-24T16:22:00',
          prerequisites: [],
          postrequisites: [],
        },
        true,
      ),
    );
    assert.ok(event.hasPrework);

    event.prerequisites.shift();
    assert.notOk(event.hasPrework);
  });
});
