import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { settled, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/weekly-calendar';

module('Integration | Component | weekly-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('en-us');
  });

  //reset locale for other tests
  hooks.afterEach(function () {
    this.owner.lookup('service:intl').setLocale('en-us');
  });

  this.createEvent = function (startDate, endDate, color) {
    this.server.create('userevent', {
      startDate: DateTime.fromFormat(startDate, 'yyyy-LL-dd hh:mm:ss').toISO(),
      endDate: DateTime.fromFormat(endDate, 'yyyy-LL-dd hh:mm:ss').toISO(),
      color: color || '#' + Math.floor(Math.random() * 16777215).toString(16),
      lastModified: endDate,
    });
  };

  test('it renders empty and is accessible', async function (assert) {
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.set('date', january9th2019.toJSDate());
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{(array)}}
      @changeToDayView={{(noop)}}
    />`);

    assert.strictEqual(component.longWeekOfYear, 'Week of January 6, 2019');
    assert.strictEqual(component.shortWeekOfYear, '1/6 — 1/12 2019');
    assert.strictEqual(component.dayHeadings.length, 7);
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(component.dayHeadings[0].text, 'Sunday Sun Jan 6 6');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with two events and is accessible', async function (assert) {
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
    />`);

    assert.strictEqual(component.dayHeadings.length, 7);
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(component.dayHeadings[0].text, 'Sunday Sun Jan 6 6');

    assert.strictEqual(component.events.length, 2);
    assert.ok(component.events[0].isFourthDayOfWeek);
    assert.strictEqual(component.events[0].name, 'event 0');
    assert.ok(component.events[1].isFourthDayOfWeek);
    assert.strictEqual(component.events[1].name, 'event 1');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with many events and is accessible', async function (assert) {
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.createEvent('2019-01-07 08:00:00', '2019-01-07 09:00:00', '#ffffff');
    this.createEvent('2019-01-11 08:00:00', '2019-01-11 09:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.createEvent('2019-01-11 08:00:00', '2019-01-11 11:00:00', '#ffffff');
    this.createEvent('2019-01-07 14:00:00', '2019-01-07 16:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
    />`);

    assert.strictEqual(component.dayHeadings.length, 7);
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(component.dayHeadings[0].text, 'Sunday Sun Jan 6 6');

    assert.strictEqual(component.events.length, 6);
    assert.ok(component.events[0].isSecondDayOfWeek);
    assert.strictEqual(component.events[0].name, 'event 0');

    assert.ok(component.events[1].isSecondDayOfWeek);
    assert.strictEqual(component.events[1].name, 'event 4');

    assert.ok(component.events[2].isFourthDayOfWeek);
    assert.strictEqual(component.events[2].name, 'event 2');

    assert.ok(component.events[3].isFourthDayOfWeek);
    assert.strictEqual(component.events[3].name, 'event 5');

    assert.ok(component.events[4].isSixthDayOfWeek);
    assert.strictEqual(component.events[4].name, 'event 1');

    assert.ok(component.events[5].isSixthDayOfWeek);
    assert.strictEqual(component.events[5].name, 'event 3');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click on day', async function (assert) {
    assert.expect(1);
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.set('date', january9th2019.toJSDate());
    this.set('changeToDayView', () => {
      assert.ok(true);
    });
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{(array)}}
      @changeToDayView={{this.changeToDayView}}
      @selectEvent={{(noop)}}
    />`);

    await component.dayHeadings[1].selectDay();
  });

  test('click on event', async function (assert) {
    assert.expect(1);
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.server.create('userevent', {
      startDate: january9th2019.toISO(),
      endDate: january9th2019.plus({ hour: 1 }).toISO(),
      offering: 1,
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    this.set('selectEvent', () => {
      assert.ok(true);
    });
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{this.selectEvent}}
    />`);

    await component.events[0].click();
  });

  test('clicking on multi event goes to day view', async function (assert) {
    assert.expect(1);
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.server.create('userevent', {
      isMulti: true,
      startDate: january9th2019.toISO(),
      endDate: january9th2019.plus({ hour: 1 }).toISO(),
      offering: 1,
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    this.set('changeToDayView', () => {
      assert.ok(true);
    });
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{this.changeToDayView}}
      @selectEvent={{(noop)}}
    />`);

    await component.events[0].click();
  });

  test('changing the locale changes the calendar dec 11 1980', async function (assert) {
    const december111980 = DateTime.fromObject({
      year: 1980,
      month: 12,
      day: 11,
      hour: 11,
      minute: 0,
      second: 0,
    });
    this.server.create('userevent', {
      startDate: december111980.toISO(),
      endDate: december111980.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', december111980.toJSDate());
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.longWeekOfYear, 'Week of December 7, 1980');
    assert.strictEqual(component.shortWeekOfYear, '12/7 — 12/13 1980');

    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(component.dayHeadings[0].text, 'Sunday Sun Dec 7 7');

    assert.strictEqual(component.events.length, 1);
    assert.ok(component.events[0].isFifthDayOfWeek);

    this.owner.lookup('service:intl').setLocale('es');
    await settled();

    assert.strictEqual(component.longWeekOfYear, 'Semana de 8 de diciembre de 1980');
    assert.strictEqual(component.shortWeekOfYear, '8/12 — 14/12 1980');
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.ok(component.dayHeadings[0].text.match('lunes lun.? 8 dic.? 8'));

    assert.strictEqual(component.events.length, 1);
    assert.ok(component.events[0].isFourthDayOfWeek);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('changing the locale changes the calendar feb 23 2020', async function (assert) {
    const february252020 = DateTime.fromObject({
      year: 2020,
      month: 2,
      day: 25,
      hour: 11,
      minute: 0,
      second: 0,
    });
    this.server.create('userevent', {
      startDate: february252020.toISO(),
      endDate: february252020.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', february252020.toJSDate());
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.longWeekOfYear, 'Week of February 23, 2020');
    assert.strictEqual(component.shortWeekOfYear, '2/23 — 2/29 2020');

    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.strictEqual(component.dayHeadings[0].text, 'Sunday Sun Feb 23 23');

    assert.strictEqual(component.events.length, 1);
    assert.ok(component.events[0].isThirdDayOfWeek);

    this.owner.lookup('service:intl').setLocale('es');
    await settled();

    assert.strictEqual(component.longWeekOfYear, 'Semana de 24 de febrero de 2020');
    assert.strictEqual(component.shortWeekOfYear, '24/2 — 1/3 2020');
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.ok(component.dayHeadings[0].text.match('lunes lun.? 24 feb.? 24'));

    assert.strictEqual(component.events.length, 1);
    assert.ok(component.events[0].isSecondDayOfWeek);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
