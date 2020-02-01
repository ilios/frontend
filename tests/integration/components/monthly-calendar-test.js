import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import moment from 'moment';
import { component } from 'ilios-common/page-objects/components/monthly-calendar';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | monthly-calendar', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders empty and is accessible', async function (assert) {
    const january9th2018 = moment('2019-01-09 08:00:00');
    this.set('date', january9th2018);
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{array}}
      @changeToDayView={{noop}}
      @selectEvent={{noop}}
    />`);

    assert.equal(component.days.length, 31);
    assert.ok(component.days[0].isTuesday);
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
      @changeToDayView={{noop}}
      @selectEvent={{noop}}
    />`);

    assert.equal(component.days.length, 31);
    assert.ok(component.days[8].isWednesday);
    assert.ok(component.days[8].isSecondWeek);
    assert.equal(component.days[8].events.length, 2);
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
      @changeToDayView={{noop}}
      @selectEvent={{noop}}
    />`);

    assert.equal(component.days.length, 31);
    assert.ok(component.days[8].isWednesday);
    assert.ok(component.days[8].isSecondWeek);
    assert.equal(component.days[8].events.length, 2);
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
      @events={{array}}
      @changeToDayView={{fn this.changeToDayView}}
      @selectEvent={{noop}}
    />`);

    await component.days[3].selectDay();
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
    await render(hbs`<MonthlyCalendar
      @date={{this.date}}
      @events={{this.events}}
      @changeToDayView={{noop}}
      @selectEvent={{fn this.selectEvent}}
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
      @changeToDayView={{fn this.changeToDayView}}
      @selectEvent={{noop}}
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
      @changeToDayView={{fn this.changeToDayView}}
      @selectEvent={{noop}}
    />`);

    await component.days[8].events[0].click();
  });
});
