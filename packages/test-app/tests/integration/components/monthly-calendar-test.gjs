import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/monthly-calendar';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { setLocale } from 'ember-intl/test-support';
import MonthlyCalendar from 'ilios-common/components/monthly-calendar';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | monthly-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  //reset locale for other tests
  hooks.afterEach(async function () {
    await setLocale('en-us');
  });

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
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{(array)}}
          @changeToDayView={{(noop)}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.ariaBusy, 'false');
    assert.strictEqual(component.title, 'January 2019');
    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[0].isThirdDayOfWeek);
    assert.ok(component.days[0].isFirstWeek);

    for (let i = 0; i < 31; i++) {
      assert.strictEqual(component.days[i].events.length, 0);
      assert.ok(component.days[i].hasNoEvents);
    }

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
      calendarStartDate: january9th2019.toISO(),
      calendarEndDate: january9th2019.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{this.events}}
          @changeToDayView={{(noop)}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.ariaBusy, 'false');
    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[8].isFourthDayOfWeek);
    assert.ok(component.days[8].isSecondWeek);
    assert.strictEqual(component.days[8].events.length, 2);
    assert.notOk(component.days[8].hasShowMore);
    assert.notOk(component.days[8].hasNoEvents);

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
      calendarStartDate: january9th2019.toISO(),
      calendarEndDate: january9th2019.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{this.events}}
          @changeToDayView={{(noop)}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[8].isFourthDayOfWeek);
    assert.ok(component.days[8].isSecondWeek);
    assert.strictEqual(component.days[8].events.length, 2);
    assert.ok(component.days[8].hasShowMore);
    assert.notOk(component.days[8].hasNoEvents);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click on day', async function (assert) {
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
      assert.step('changeToDayView called');
    });
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{(array)}}
          @changeToDayView={{this.changeToDayView}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );

    await component.days[3].selectDay();
    assert.verifySteps(['changeToDayView called']);
  });

  test('click on event', async function (assert) {
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
      calendarStartDate: january9th2019.toISO(),
      calendarEndDate: january9th2019.plus({ hour: 1 }).toISO(),
      offering: 1,
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    this.set('selectEvent', () => {
      assert.step('selectEvent called');
    });
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{this.events}}
          @changeToDayView={{(noop)}}
          @selectEvent={{this.selectEvent}}
        />
      </template>,
    );

    await component.days[8].events[0].click();
    assert.verifySteps(['selectEvent called']);
  });

  test('click on show more', async function (assert) {
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
      calendarStartDate: january9th2019.toISO(),
      calendarEndDate: january9th2019.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    this.set('changeToDayView', () => {
      assert.step('changeToDayView called');
    });
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{this.events}}
          @changeToDayView={{this.changeToDayView}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );

    await component.days[8].showMore();
    assert.verifySteps(['changeToDayView called']);
  });

  test('clicking on multi event goes to day view', async function (assert) {
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
      calendarStartDate: january9th2019.toISO(),
      calendarEndDate: january9th2019.plus({ hour: 1 }).toISO(),
      offering: 1,
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2019.toJSDate());
    this.set('changeToDayView', () => {
      assert.step('changeToDayView');
    });
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{this.events}}
          @changeToDayView={{this.changeToDayView}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );

    await component.days[8].events[0].click();
    assert.verifySteps(['changeToDayView']);
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
      calendarStartDate: december112017.toISO(),
      calendarEndDate: december112017.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', december112017.toJSDate());
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{this.events}}
          @changeToDayView={{(noop)}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[10].isSecondDayOfWeek);
    assert.ok(component.days[10].isThirdWeek);
    assert.strictEqual(component.days[10].events.length, 1);

    await setLocale('es');

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
      calendarStartDate: february1st2020.toISO(),
      calendarEndDate: february1st2020.plus({ hour: 1 }).toISO(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', february1st2020.toJSDate());
    await render(
      <template>
        <MonthlyCalendar
          @date={{this.date}}
          @events={{this.events}}
          @changeToDayView={{(noop)}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.days.length, 29);
    assert.ok(component.days[0].isSeventhDayOfWeek);
    assert.ok(component.days[0].isFirstWeek);
    assert.strictEqual(component.days[0].events.length, 1);

    await setLocale('es');

    assert.strictEqual(component.days.length, 29);
    assert.ok(component.days[0].isSixthDayOfWeek);
    assert.ok(component.days[0].isFirstWeek);
    assert.strictEqual(component.days[0].events.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('events are loading', async function (assert) {
    this.set('date', DateTime.now().toJSDate());
    await render(
      <template>
        <MonthlyCalendar
          @isLoadingEvents={{true}}
          @date={{this.date}}
          @events={{(array)}}
          @changeToDayView={{(noop)}}
          @selectEvent={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.ariaBusy, 'true');
    assert.strictEqual(component.title, 'Loading Events ...');
  });
});
