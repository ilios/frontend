import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { DateTime } from 'luxon';

module('Integration | Component | ilios calendar multiday events', function (hooks) {
  setupRenderingTest(hooks);

  const getEvents = function () {
    return [
      {
        startDate: DateTime.fromISO('1984-11-11').toJSDate(),
        endDate: DateTime.fromISO('1984-11-12').toJSDate(),
        name: 'Cheramie is born',
        location: 'Lancaster, CA',
      },
      {
        startDate: DateTime.fromISO('1980-12-10').toJSDate(),
        endDate: DateTime.fromISO('1980-12-11').toJSDate(),
        name: 'Jonathan is born',
        location: 'Lancaster, CA',
      },
    ];
  };

  test('it renders', async function (assert) {
    this.set('events', getEvents());
    await render(hbs`<IliosCalendarMultidayEvents @events={{this.events}} />`);

    assert.dom('[data-test-title]').containsText('Multiday Events');
    assert.dom('li').exists({ count: 2 });
    await a11yAudit(this.element);
  });
});
