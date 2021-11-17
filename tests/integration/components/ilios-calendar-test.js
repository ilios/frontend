import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    assert.expect(1);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);

    await render(hbs`<IliosCalendar
      @selectedDate={{this.date}}
      @selectedView="day"
      @calendarEvents={{(array)}}
      @changeDate={{(noop)}}
      @changeView={{(noop)}}
      @selectEvent={{(noop)}}
    />`);
    assert.dom().includesText('Wednesday, September 30, 2015');
  });
});
