import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { settled, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/daily-calendar';

module('Integration | Component | daily-calendar', function (hooks) {
  setupRenderingTest(hooks);
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
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{array}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.longDayOfWeek, 'Wednesday, January 9, 2019');
    assert.strictEqual(component.shortDayOfWeek, '1/9/2019');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with two events and is accessible', async function (assert) {
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
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
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.createEvent('2019-01-07 08:00:00', '2019-01-07 09:00:00', '#ffffff');
    this.createEvent('2019-01-11 08:00:00', '2019-01-11 09:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.createEvent('2019-01-11 08:00:00', '2019-01-11 11:00:00', '#ffffff');
    this.createEvent('2019-01-07 14:00:00', '2019-01-07 16:00:00', '#ffffff');
    this.createEvent('2019-01-09 08:00:00', '2019-01-09 09:00:00', '#ffffff');
    this.set('events', this.server.db.userevents);
    this.set('date', january9th2018);
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
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @selectEvent={{this.selectEvent}}
    />`);

    await component.events[0].click();
  });

  test('changing the locale changes the title', async function (assert) {
    const december111980 = moment('1980-12-11 11:00:00');
    this.server.create('userevent', {
      startDate: december111980.format(),
      endDate: december111980.clone().add(1, 'hour').format(),
    });
    this.set('events', this.server.db.userevents);
    this.set('date', december111980);
    await render(hbs`<DailyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @selectEvent={{(noop)}}
    />`);

    assert.strictEqual(component.longDayOfWeek, 'Thursday, December 11, 1980');
    assert.strictEqual(component.shortDayOfWeek, '12/11/1980');
    assert.strictEqual(component.events.length, 1);

    this.owner.lookup('service:intl').setLocale('es');
    this.owner.lookup('service:moment').setLocale('es');
    await settled();

    assert.strictEqual(component.longDayOfWeek, 'jueves, 11 de diciembre de 1980');
    assert.strictEqual(component.shortDayOfWeek, '11/12/1980');
    assert.strictEqual(component.events.length, 1);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
