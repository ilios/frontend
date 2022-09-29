import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/monthly-calendar';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | monthly-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

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
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{(array)}}
      @changeToDayView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[0].isThirdDayOfWeek);
    assert.ok(component.days[0].isFirstWeek);

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
    this.server.createList('userevent', 2, {
      startDate: january9th2019.toISO(),
      endDate: january9th2019.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[8].isFourthDayOfWeek);
    assert.ok(component.days[8].isSecondWeek);
    assert.strictEqual(component.days[8].events.length, 2);
    assert.notOk(component.days[8].hasShowMore);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with three events and is accessible', async function (assert) {
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.server.createList('userevent', 3, {
      startDate: january9th2019.toISO(),
      endDate: january9th2019.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[8].isFourthDayOfWeek);
    assert.ok(component.days[8].isSecondWeek);
    assert.strictEqual(component.days[8].events.length, 2);
    assert.ok(component.days[8].hasShowMore);

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
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{(array)}}
      @changeToDayView={{this.changeToDayView}}
      @selectEvent={{(noop)}}
    />`);

    await component.days[3].selectDay();
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
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{this.selectEvent}}
    />`);

    await component.days[8].events[0].click();
  });

  test('click on show more', async function (assert) {
    assert.expect(1);
    const january9th2019 = DateTime.fromObject({
      year: 2019,
      month: 1,
      day: 9,
      hour: 8,
      minute: 0,
      second: 0,
    });
    this.server.createList('userevent', 3, {
      startDate: january9th2019.toISO(),
      endDate: january9th2019.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    this.set('changeToDayView', () => {
      assert.ok(true);
    });
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{this.changeToDayView}}
      @selectEvent={{(noop)}}
    />`);

    await component.days[8].showMore();
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
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{this.changeToDayView}}
      @selectEvent={{(noop)}}
    />`);

    await component.days[8].events[0].click();
  });

  test('changing the locale changes the calendar dec 2017', async function (assert) {
    const december112017 = DateTime.fromObject({
      year: 2017,
      month: 12,
      day: 11,
      hour: 11,
      minute: 0,
      second: 0,
    });
    this.server.create('userevent', {
      startDate: december112017.toISO(),
      endDate: december112017.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', december112017.toJSDate());
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[10].isSecondDayOfWeek);
    assert.ok(component.days[10].isThirdWeek);
    assert.strictEqual(component.days[10].events.length, 1);

    this.owner.lookup('service:intl').setLocale('es');
    await settled();

    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[10].isFirstDayOfWeek);
    assert.ok(component.days[10].isThirdWeek);
    assert.strictEqual(component.days[10].events.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('changing the locale changes the calendar feb 2020', async function (assert) {
    const february1st2020 = DateTime.fromObject({
      year: 2020,
      month: 2,
      day: 1,
      hour: 10,
      minute: 0,
      second: 0,
    });
    this.server.create('userevent', {
      startDate: february1st2020.toISO(),
      endDate: february1st2020.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', february1st2020.toJSDate());
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.days.length, 29);
    assert.ok(component.days[0].isSeventhDayOfWeek);
    assert.ok(component.days[0].isFirstWeek);
    assert.strictEqual(component.days[0].events.length, 1);
    this.owner.lookup('service:intl').setLocale('es');
    this.owner.lookup('service:moment').setLocale('es');
    await settled();

    assert.strictEqual(component.days.length, 29);
    assert.ok(component.days[0].isSixthDayOfWeek);
    assert.ok(component.days[0].isFirstWeek);
    assert.strictEqual(component.days[0].events.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
