import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-week';

module('Integration | Component | ilios calendar week', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    await render(hbs`<IliosCalendarWeek @date={{this.date}} @calendarEvents={{(array)}} />`);
    assert.strictEqual(component.calendar.longWeekOfYear, 'Week of September 27, 2015');
    assert.strictEqual(component.calendar.events.length, 0);
  });

  test('clicking on a day header fires the correct events', async function (assert) {
    assert.expect(3);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('changeDate', (newDate) => {
      assert.ok(newDate instanceof Date);
      assert.strictEqual(newDate.toString().search(/Sun Sep 27/), 0);
    });
    this.set('changeView', (newView) => {
      assert.strictEqual(newView, 'day');
    });

    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @calendarEvents={{(array)}}
      @areDaysSelectable={{true}}
      @changeDate={{this.changeDate}}
      @changeView={{this.changeView}}
    />`);
    component.calendar.dayHeadings[0].selectDay();
  });

  test('clicking on a day header does nothing when areDaysSelectable is false', async function (assert) {
    assert.expect(0);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('changeDate', () => {
      assert.ok(false, 'this should never fire.');
    });
    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @calendarEvents={{(array)}}
      @areDaysSelectable={{false}}
      @changeDate={{this.changeDate}}
      @changeView={{(noop)}}
    />`);
    await component.calendar.dayHeadings[0].selectDay();
  });
});
