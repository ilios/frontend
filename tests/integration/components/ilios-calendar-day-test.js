import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-day';
import { DateTime } from 'luxon';

module('Integration | Component | ilios calendar day', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    const september30th2015 = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', september30th2015.toISO());
    await render(
      hbs`<IliosCalendarDay @date={{this.date}} @selectEvent={{(noop)}} @calendarEvents={{(array)}} />`
    );
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.strictEqual(component.calendar.longDayOfWeek, 'Wednesday, September 30, 2015');
    assert.strictEqual(component.calendar.events.length, 0);
  });
});
