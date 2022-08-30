import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { DateTime } from 'luxon';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-multiday-events';

module('Integration | Component | ilios calendar multiday events', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

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
    await render(hbs`<IliosCalendarMultidayEvents @events={{this.events}} />`);
    assert.strictEqual(component.title, 'Multiday Events');
    assert.strictEqual(component.events.length, 2);
    await a11yAudit(this.element);
  });
});
