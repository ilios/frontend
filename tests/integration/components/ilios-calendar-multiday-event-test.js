import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import hbs from 'htmlbars-inline-precompile';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-multiday-event';

module('Integration | Component | ilios calendar multiday event', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.ev = {
      startDate: DateTime.fromISO('1984-11-11').toISO(),
      endDate: DateTime.fromISO('1984-11-12').toISO(),
      name: 'Cheramie is born',
      location: 'Lancaster, CA',
    };
  });

  test('event displays correctly', async function (assert) {
    await render(hbs`
      <ul>
        <IliosCalendarMultidayEvent
          @event={{this.ev}}
          @isEventSelectable={{true}}
          @selectEvent={{(noop)}}
        />
      </ul>
    `);
    assert.strictEqual(
      component.text,
      '11/11/84, 12:00 AM – 11/12/84, 12:00 AM Cheramie is born Lancaster, CA'
    );
    await a11yAudit(this.element);
  });

  test('action fires on click', async function (assert) {
    assert.expect(2);
    this.ev.offering = 1;
    this.set('selectEvent', (value) => {
      assert.deepEqual(this.ev, value);
    });
    await render(hbs`
      <IliosCalendarMultidayEvent
        @event={{this.ev}}
        @isEventSelectable={{true}}
        @selectEvent={{this.selectEvent}}
      />
    `);
    assert.notOk(component.isDisabled);
    await component.click();
  });

  test('event is disabled for scheduled events', async function (assert) {
    await render(hbs`
      <IliosCalendarMultidayEvent
        @event={{this.ev}}
        @isEventSelectable={{true}}
        @selectEvent={{this.selectEvent}}
      />
    `);
    assert.ok(component.isDisabled);
  });

  test('event is disabled when not explicitly flagged as selectable', async function (assert) {
    this.ev.offering = 1;
    await render(hbs`
      <IliosCalendarMultidayEvent
        @event={{this.ev}}
        @selectEvent={{this.selectEvent}}
      />
    `);
    assert.ok(component.isDisabled);
  });
});
