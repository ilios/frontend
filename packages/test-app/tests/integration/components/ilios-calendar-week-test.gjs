import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-week';
import { DateTime } from 'luxon';
import IliosCalendarWeek from 'ilios-common/components/ilios-calendar-week';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | ilios calendar week', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const date = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', date.toJSDate());
    await render(
      <template><IliosCalendarWeek @date={{this.date}} @calendarEvents={{(array)}} /></template>,
    );
    assert.strictEqual(component.calendar.title.longWeekOfYear, 'Week of September 27, 2015');
    assert.strictEqual(component.calendar.events.length, 0);
  });

  test('clicking on a day header fires the correct events', async function (assert) {
    assert.expect(2);
    const date = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', date.toJSDate());
    this.set('changeDate', (newDate) => {
      assert.strictEqual(newDate, '2015-09-27');
    });
    this.set('changeView', (newView) => {
      assert.strictEqual(newView, 'day');
    });

    await render(
      <template>
        <IliosCalendarWeek
          @date={{this.date}}
          @calendarEvents={{(array)}}
          @areDaysSelectable={{true}}
          @changeDate={{this.changeDate}}
          @changeView={{this.changeView}}
        />
      </template>,
    );
    await component.calendar.dayHeadings[0].selectDay();
  });

  test('clicking on a day header does nothing when areDaysSelectable is false', async function (assert) {
    assert.expect(0);
    const date = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', date.toJSDate());
    this.set('changeDate', () => {
      assert.ok(false, 'this should never fire.');
    });
    await render(
      <template>
        <IliosCalendarWeek
          @date={{this.date}}
          @calendarEvents={{(array)}}
          @areDaysSelectable={{false}}
          @changeDate={{this.changeDate}}
          @changeView={{(noop)}}
        />
      </template>,
    );
    await component.calendar.dayHeadings[0].selectDay();
  });
});
