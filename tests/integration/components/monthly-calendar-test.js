import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';
import { component } from 'ilios-common/page-objects/components/monthly-calendar';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | monthly-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('en-us');
    this.owner.lookup('service:moment').setLocale('en');
  });

  //reset locale for other tests
  hooks.afterEach(function () {
    this.owner.lookup('service:intl').setLocale('en-us');
    this.owner.lookup('service:moment').setLocale('en');
  });

  test('it renders empty and is accessible', async function (assert) {
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.set('date', january9th2018);
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
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.server.createList('userevent', 2, {
      startDate: january9th2018.format(),
      endDate: january9th2018.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
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
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.server.createList('userevent', 3, {
      startDate: january9th2018.format(),
      endDate: january9th2018.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
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
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.set('date', january9th2018);
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
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.server.create('userevent', {
      startDate: january9th2018.format(),
      endDate: january9th2018.clone().add(1, 'hour').format(),
      offering: 1,
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
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
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.server.createList('userevent', 3, {
      startDate: january9th2018.format(),
      endDate: january9th2018.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
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
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.server.create('userevent', {
      isMulti: true,
      startDate: january9th2018.format(),
      endDate: january9th2018.clone().add(1, 'hour').format(),
      offering: 1,
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
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
    const december112017 = moment('2017-12-11 11:00:00');
    this.server.create('userevent', {
      startDate: december112017.format(),
      endDate: december112017.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', december112017);
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
    this.owner.lookup('service:moment').setLocale('es');
    await settled();

    assert.strictEqual(component.days.length, 31);
    assert.ok(component.days[10].isFirstDayOfWeek);
    assert.ok(component.days[10].isThirdWeek);
    assert.strictEqual(component.days[10].events.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('changing the locale changes the calendar feb 2020', async function (assert) {
    const february1st2020 = moment('2020-02-01 10:00:00');
    this.server.create('userevent', {
      startDate: february1st2020.format(),
      endDate: february1st2020.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', february1st2020.toDate());
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
