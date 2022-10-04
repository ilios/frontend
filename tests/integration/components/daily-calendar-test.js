import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { settled, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/daily-calendar';

module('Integration | Component | daily-calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  //reset locale for other tests
  hooks.afterEach(function () {
    this.owner.lookup('service:intl').setLocale('en-us');
  });

  this.createEvent = function (startDate, endDate, color) {
    this.server.create('userevent', {
      startDate: DateTime.fromFormat(startDate, 'y-MM-dd h:m:s').toISO(),
      endDate: DateTime.fromFormat(endDate, 'y-MM-dd h:m:s').toISO(),
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
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{(array)}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.longDayOfWeek, 'Wednesday, January 9, 2019');
    assert.strictEqual(component.shortDayOfWeek, '1/9/2019');

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
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.longDayOfWeek, 'Wednesday, January 9, 2019');

    assert.strictEqual(component.events.length, 2);
    assert.strictEqual(component.events[0].name, 'event 0');
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
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.events.length, 6);
    assert.strictEqual(component.events[0].name, 'event 0');
    assert.strictEqual(component.events[1].name, 'event 4');
    assert.strictEqual(component.events[2].name, 'event 2');
    assert.strictEqual(component.events[3].name, 'event 5');
    assert.strictEqual(component.events[4].name, 'event 1');
    assert.strictEqual(component.events[5].name, 'event 3');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
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
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @selectEvent={{this.selectEvent}}
    />`);

    await component.events[0].click();
  });

  test('changing the locale changes the title', async function (assert) {
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
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.longDayOfWeek, 'Thursday, December 11, 1980');
    assert.strictEqual(component.shortDayOfWeek, '12/11/1980');
    assert.strictEqual(component.events.length, 1);

    this.owner.lookup('service:intl').setLocale('es');
    await settled();

    assert.strictEqual(component.longDayOfWeek, 'jueves, 11 de diciembre de 1980');
    assert.strictEqual(component.shortDayOfWeek, '11/12/1980');
    assert.strictEqual(component.events.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
