import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/ilios-calendar';
import { DateTime } from 'luxon';

module('Integration | Component | ilios calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders in day view mode', async function (assert) {
    const date = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    const today = DateTime.now().toFormat('yyyy-MM-dd');
    this.set('date', date.toJSDate());

    await render(hbs`<IliosCalendar
      @selectedDate={{this.date}}
      @selectedView="day"
      @calendarEvents={{(array)}}
      @changeDate={{(noop)}}
      @changeView={{(noop)}}
      @selectEvent={{(noop)}}
    />
`);
    assert.strictEqual(component.daily.longDayOfWeek, 'Wednesday, September 30, 2015');
    assert.notOk(component.monthly.isVisible);
    assert.notOk(component.weekly.isVisible);
    assert.strictEqual(component.viewModes.length, 3);
    assert.strictEqual(component.viewModes[0].text, 'Day');
    assert.ok(component.viewModes[0].isActive);
    assert.strictEqual(component.viewModes[1].text, 'Week');
    assert.strictEqual(component.viewModes[1].linksTo, '/dashboard/calendar');
    assert.strictEqual(component.viewModes[2].text, 'Month');
    assert.strictEqual(component.viewModes[2].linksTo, '/dashboard/calendar?view=month');
    assert.strictEqual(component.goBack.text, 'Back');
    assert.strictEqual(component.goToToday.text, 'Today');
    assert.strictEqual(component.goForward.text, 'Forward');
    assert.strictEqual(component.goBack.linksTo, '/dashboard/calendar?date=2015-09-29');
    assert.strictEqual(component.goToToday.linksTo, `/dashboard/calendar?date=${today}`);
    assert.strictEqual(component.goForward.linksTo, '/dashboard/calendar?date=2015-10-01');
  });

  test('it renders in week view mode', async function (assert) {
    const date = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', date.toJSDate());

    await render(hbs`<IliosCalendar
      @selectedDate={{this.date}}
      @selectedView="week"
      @calendarEvents={{(array)}}
      @changeDate={{(noop)}}
      @changeView={{(noop)}}
      @selectEvent={{(noop)}}
    />
`);
    assert.strictEqual(component.weekly.longWeekOfYear, 'Week of September 27, 2015');
    assert.notOk(component.monthly.isVisible);
    assert.notOk(component.daily.isVisible);
    assert.strictEqual(component.viewModes[0].linksTo, '/dashboard/calendar?view=day');
    assert.ok(component.viewModes[1].isActive);
    assert.strictEqual(component.viewModes[2].linksTo, '/dashboard/calendar?view=month');
    assert.strictEqual(component.goBack.linksTo, '/dashboard/calendar?date=2015-09-23');
    assert.strictEqual(component.goForward.linksTo, '/dashboard/calendar?date=2015-10-07');
  });

  test('it renders in month view mode', async function (assert) {
    const date = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', date.toJSDate());

    await render(hbs`<IliosCalendar
      @selectedDate={{this.date}}
      @selectedView="month"
      @calendarEvents={{(array)}}
      @changeDate={{(noop)}}
      @changeView={{(noop)}}
      @selectEvent={{(noop)}}
    />
`);
    assert.strictEqual(component.monthly.monthYear, 'September 2015');
    assert.notOk(component.daily.isVisible);
    assert.notOk(component.weekly.isVisible);
    assert.strictEqual(component.viewModes[0].linksTo, '/dashboard/calendar?view=day');
    assert.strictEqual(component.viewModes[1].linksTo, '/dashboard/calendar');
    assert.ok(component.viewModes[2].isActive);
    assert.strictEqual(component.goBack.linksTo, '/dashboard/calendar?date=2015-08-30');
    assert.strictEqual(component.goForward.linksTo, '/dashboard/calendar?date=2015-10-30');
  });

  test('toggle ics feed visibility', async function (assert) {
    const date = DateTime.fromObject({
      year: 2015,
      month: 9,
      day: 30,
      hour: 12,
      minute: 0,
      second: 0,
    });
    this.set('date', date.toJSDate());

    await render(hbs`<IliosCalendar
      @selectedDate={{this.date}}
      @selectedView="month"
      @calendarEvents={{(array)}}
      @changeDate={{(noop)}}
      @changeView={{(noop)}}
      @selectEvent={{(noop)}}
    />
`);
    assert.notOk(component.icsFeed.isVisible);
    await component.icsFeedToggle.click();
    assert.ok(component.icsFeed.isVisible);
    await component.icsFeedToggle.click();
    assert.notOk(component.icsFeed.isVisible);
  });
});
