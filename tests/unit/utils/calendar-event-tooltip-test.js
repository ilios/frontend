import calendarEventTooltip from 'dummy/utils/calendar-event-tooltip';
import { module, test } from 'qunit';
import moment from 'moment';

module('Unit | Utility | calendar-event-tooltip', function() {

  test('it works for blanked event', function (assert) {
    const today = moment().hour(8);
    const result = calendarEventTooltip({
      startDate: today.toDate(),
      endDate: today.toDate(),
      name: 'test',
    }, {}, 'hh');
    assert.equal(result, 'TBD<br />08 - 08<br />test');
  });
});
