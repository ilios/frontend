import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-day';

module('Integration | Component | ilios calendar day', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    await render(
      hbs`<IliosCalendarDay @date={{this.date}} @selectEvent={{(noop)}} @calendarEvents={{(array)}} />`
    );
    //Date input is Wednesday, Septrmber 30th.  Should be the first string
    assert.strictEqual(component.calendar.longDayOfWeek, 'Wednesday, September 30, 2015');
    assert.strictEqual(component.calendar.events.length, 0);
  });
});
