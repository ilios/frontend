import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-multiday-event';
import IliosCalendarMultidayEvent from 'ilios-common/components/ilios-calendar-multiday-event';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | ilios calendar multiday event', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.ev = {
      startDate: DateTime.fromISO('1984-11-11').toISO(),
      endDate: DateTime.fromISO('1984-11-12').toISO(),
      name: 'Cheramie is born',
      location: 'Lancaster, CA',
    };
  });

  test('event displays correctly', async function (assert) {
    await render(
      <template>
        <ul>
          <IliosCalendarMultidayEvent
            @event={{this.ev}}
            @isEventSelectable={{true}}
            @selectEvent={{(noop)}}
          />
        </ul>
      </template>,
    );
    assert.strictEqual(
      component.text,
      '11/11/84, 12:00 AM – 11/12/84, 12:00 AM Cheramie is born Lancaster, CA',
    );
    await a11yAudit(this.element);
  });

  test('action fires on click', async function (assert) {
    assert.expect(2);
    this.ev.offering = 1;
    this.set('selectEvent', (value) => {
      assert.deepEqual(this.ev, value);
    });
    await render(
      <template>
        <IliosCalendarMultidayEvent
          @event={{this.ev}}
          @isEventSelectable={{true}}
          @selectEvent={{this.selectEvent}}
        />
      </template>,
    );
    assert.notOk(component.isDisabled);
    await component.click();
  });

  test('event is disabled for scheduled events', async function (assert) {
    await render(
      <template>
        <IliosCalendarMultidayEvent
          @event={{this.ev}}
          @isEventSelectable={{true}}
          @selectEvent={{this.selectEvent}}
        />
      </template>,
    );
    assert.ok(component.isDisabled);
  });

  test('event is disabled when not explicitly flagged as selectable', async function (assert) {
    this.ev.offering = 1;
    await render(
      <template>
        <IliosCalendarMultidayEvent @event={{this.ev}} @selectEvent={{this.selectEvent}} />
      </template>,
    );
    assert.ok(component.isDisabled);
  });
});
