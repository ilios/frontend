import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-multiday-events';
import IliosCalendarMultidayEvents from 'ilios-common/components/ilios-calendar-multiday-events';

module('Integration | Component | ilios calendar multiday events', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.events = [
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
  });

  test('it renders', async function (assert) {
    await render(<template><IliosCalendarMultidayEvents @events={{this.events}} /></template>);
    assert.strictEqual(component.title, 'Multiday Events');
    assert.strictEqual(component.events.length, 2);
    await a11yAudit(this.element);
  });
});
