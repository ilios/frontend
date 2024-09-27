import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
const s = '[data-test-ilios-calendar-event-month]';

module('Integration | Component | ilios calendar event month', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const november111984 = DateTime.fromObject({ year: 1984, month: 11, day: 11, hour: 8 });

    this.set('event', {
      color: '#00cc65',
      startDate: november111984.toJSDate(),
      endDate: november111984.plus({ hour: 1 }).toJSDate(),
      lastModified: november111984.toJSDate(),
      name: 'test',
    });
    await render(hbs`<IliosCalendarEventMonth @event={{this.event}} />`);

    assert.dom(s).hasStyle({
      'background-color': 'rgb(0, 204, 101)',
    });
    assert.dom(s).hasStyle({
      'border-left-style': 'solid',
      'border-left-color': 'rgb(0, 173, 86)',
    });
    assert.dom(s).hasText('08:00 AM - 09:00 AM : test');
  });
});
