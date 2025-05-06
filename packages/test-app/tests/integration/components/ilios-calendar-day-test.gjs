import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-day';
import { DateTime } from 'luxon';
import IliosCalendarDay from 'ilios-common/components/ilios-calendar-day';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | ilios calendar day', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const september30th2015 = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', september30th2015.toJSDate());
    await render(
      <template>
        <IliosCalendarDay @date={{this.date}} @selectEvent={{(noop)}} @calendarEvents={{(array)}} />
      </template>,
    );
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.strictEqual(component.calendar.title.longDayOfWeek, 'Wednesday, September 30, 2015');
    assert.strictEqual(component.calendar.events.length, 0);
  });
});
