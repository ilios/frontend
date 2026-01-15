import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { DateTime } from 'luxon';
import Event from 'ilios-common/classes/event';

module('Unit | Service | calendar-event-tooltip', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.calendarEventTooltip = this.owner.lookup('service:calendar-event-tooltip');
  });

  test('it works for blanked event', function (assert) {
    const today = DateTime.fromObject({ hour: 8 });
    const result = this.calendarEventTooltip.create(
      {
        startDate: today.toISO(),
        endDate: today.toISO(),
        name: 'test',
      },
      'hh',
    );
    assert.strictEqual(result.toString(), 'TBD<br />08 - 08<br />test');
  });

  test('offering-based event', function (assert) {
    const today = DateTime.fromObject({ hour: 8 });
    const result = this.calendarEventTooltip.create(
      {
        startDate: today.toISO(),
        endDate: today.toISO(),
        name: 'test',
        location: 'room 101',
        instructors: ['Larry', 'Curly', 'Moe', 'Shemp'],
        courseTitle: 'Intro 101',
        isMulti: false,
        sessionTypeTitle: 'lecture',
        offering: 1,
      },
      'hh',
    );
    assert.strictEqual(
      result.toString(),
      'room 101<br />08 - 08<br />test<br /> Taught By Larry, Curly et al.<br />Course: Intro 101<br />Session Type: lecture',
    );
  });

  test('ILM-based event', function (assert) {
    const today = DateTime.fromObject({ hour: 8 });
    const result = this.calendarEventTooltip.create(
      {
        startDate: today.toISO(),
        endDate: today.toISO(),
        name: 'test',
        location: 'room 101',
        instructors: ['Larry', 'Curly', 'Moe', 'Shemp'],
        courseTitle: 'Intro 101',
        isMulti: false,
        sessionTypeTitle: 'lecture',
        ilmSession: 1,
      },
      'hh',
    );
    assert.strictEqual(
      result.toString(),
      'room 101<br />ILM - Due By 08<br />test<br /> Taught By Larry, Curly et al.<br />Course: Intro 101<br />Session Type: lecture',
    );
  });

  test('has pre-work', function (assert) {
    const today = DateTime.fromObject({ hour: 8 });
    const result = this.calendarEventTooltip.create(
      new Event(
        {
          startDate: today.toISO(),
          endDate: today.toISO(),
          name: 'test',
          location: 'room 101',
          instructors: [],
          courseTitle: 'Intro 101',
          isMulti: false,
          sessionTypeTitle: 'lecture',
          offering: 1,
          prerequisites: [
            {
              name: 'prework',
              prerequisites: [],
              postrequisites: [],
            },
          ],
          postrequisites: [],
        },
        true,
      ),
      'hh',
    );
    assert.strictEqual(
      result.toString(),
      'room 101<br />08 - 08<br />test<br />Course: Intro 101<br />Session Type: lecture<br />Has pre-work',
    );
  });
});
