import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { settled, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios-common/page-objects/components/weekly-calendar';

module('Integration | Component | weekly-calendar', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('en-us');
    this.owner.lookup('service:moment').setLocale('en-us');
  });

  this.createEvent = function (startDate, endDate, color) {
    this.server.create('userevent', {
      startDate: moment(startDate).toDate(),
      endDate: moment(endDate).toDate(),
      color: color || '#' + Math.floor(Math.random() * 16777215).toString(16),
      lastModified: endDate,
    });
  };

  test('it renders empty and is accessible', async function (assert) {
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.set('date', january9th2018.toDate());
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{array}}
      @changeToDayView={{noop}}
    />`);

    assert.equal(component.longWeekOfYear, 'Week of January 6 2019');
    assert.equal(component.shortWeekOfYear, '1/6 — 1/12 2019');
    assert.equal(component.dayHeadings.length, 7);
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.equal(component.dayHeadings[0].text, 'Sunday Sun');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with two events and is accessible', async function (assert) {
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{noop}}
    />`);

    assert.equal(component.dayHeadings.length, 7);
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.equal(component.dayHeadings[0].text, 'Sunday Sun');

    assert.equal(component.events.length, 2);
    assert.ok(component.events[0].isFourthDayOfWeek);
    assert.equal(component.events[0].name, 'event 0');
    assert.ok(component.events[1].isFourthDayOfWeek);
    assert.equal(component.events[1].name, 'event 1');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with many events and is accessible', async function (assert) {
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.createEvent('2019-01-07 08:00:00', '2019-01-07 09:00:00', '#ffffff');
    this.createEvent('2019-01-11 08:00:00', '2019-01-11 09:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.createEvent('2019-01-11 08:00:00', '2019-01-11 11:00:00', '#ffffff');
    this.createEvent('2019-01-07 14:00:00', '2019-01-07 16:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{noop}}
    />`);

    assert.equal(component.dayHeadings.length, 7);
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.equal(component.dayHeadings[0].text, 'Sunday Sun');

    assert.equal(component.events.length, 6);
    assert.ok(component.events[0].isSecondDayOfWeek);
    assert.equal(component.events[0].name, 'event 0');

    assert.ok(component.events[1].isSecondDayOfWeek);
    assert.equal(component.events[1].name, 'event 4');

    assert.ok(component.events[2].isFourthDayOfWeek);
    assert.equal(component.events[2].name, 'event 2');

    assert.ok(component.events[3].isFourthDayOfWeek);
    assert.equal(component.events[3].name, 'event 5');

    assert.ok(component.events[4].isSixthDayOfWeek);
    assert.equal(component.events[4].name, 'event 1');

    assert.ok(component.events[5].isSixthDayOfWeek);
    assert.equal(component.events[5].name, 'event 3');

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
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{array}}
      @changeToDayView={{fn this.changeToDayView}}
      @selectEvent={{noop}}
    />`);

    await component.dayHeadings[1].selectDay();
  });

  test('click on event', async function (assert) {
    assert.expect(1);
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.server.create('userevent', {
      startDate: january9th2018.format(),
      endDate: january9th2018.clone().add(1, 'hour').format(),
      offering: 1
    });
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
    this.set('selectEvent', () => {
      assert.ok(true);
    });
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{noop}}
      @selectEvent={{fn this.selectEvent}}
    />`);

    await component.events[0].click();
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
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{fn this.changeToDayView}}
      @selectEvent={{noop}}
    />`);

    await component.events[0].click();
  });

  test('changing the locale changes the calendar dec 11 1980', async function (assert) {
    const december111980 = moment('1980-12-11 11:00:00');
    this.server.create('userevent', {
      startDate: december111980.format(),
      endDate: december111980.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', december111980);
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{noop}}
      @selectEvent={{noop}}
    />`);

    assert.equal(component.longWeekOfYear, 'Week of December 7 1980');
    assert.equal(component.shortWeekOfYear, '12/7 — 12/13 1980');

    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.equal(component.dayHeadings[0].text, 'Sunday Sun');

    assert.equal(component.events.length, 1);
    assert.ok(component.events[0].isFifthDayOfWeek);


    this.owner.lookup('service:intl').setLocale('es');
    this.owner.lookup('service:moment').setLocale('es');
    await settled();

    assert.equal(component.longWeekOfYear, 'Semana de diciembre 8º 1980');
    assert.equal(component.shortWeekOfYear, '12/8 — 12/14 1980');
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.equal(component.dayHeadings[0].text, 'lunes lun.');

    assert.equal(component.events.length, 1);
    assert.ok(component.events[0].isFourthDayOfWeek);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('changing the locale changes the calendar feb 23 2020', async function (assert) {
    const february252020 = moment('2020-02-25 11:00:00');
    this.server.create('userevent', {
      startDate: february252020.format(),
      endDate: february252020.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', february252020);
    await render(hbs`<WeeklyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{noop}}
      @selectEvent={{noop}}
    />`);

    assert.equal(component.longWeekOfYear, 'Week of February 23 2020');
    assert.equal(component.shortWeekOfYear, '2/23 — 2/29 2020');

    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.equal(component.dayHeadings[0].text, 'Sunday Sun');

    assert.equal(component.events.length, 1);
    assert.ok(component.events[0].isThirdDayOfWeek);


    this.owner.lookup('service:intl').setLocale('es');
    this.owner.lookup('service:moment').setLocale('es');
    await settled();

    assert.equal(component.longWeekOfYear, 'Semana de febrero 24º 2020');
    assert.equal(component.shortWeekOfYear, '2/24 — 3/1 2020');
    assert.ok(component.dayHeadings[0].isFirstDayOfWeek);
    assert.equal(component.dayHeadings[0].text, 'lunes lun.');

    assert.equal(component.events.length, 1);
    assert.ok(component.events[0].isSecondDayOfWeek);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
