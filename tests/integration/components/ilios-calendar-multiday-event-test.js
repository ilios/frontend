import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import moment from 'moment';
import hbs from 'htmlbars-inline-precompile';
import { a11yAudit } from 'ember-a11y-testing/test-support';

const getEvent = function () {
  return {
    startDate: moment('1984-11-11').toDate(),
    endDate: moment('1984-11-12').toDate(),
    name: 'Cheramie is born',
    location: 'Lancaster, CA',
  };
};

module('Integration | Component | ilios calendar multiday event', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('event displays correctly', async function (assert) {
    assert.expect(3);
    const event = getEvent();
    this.set('event', event);
    await render(hbs`
      <ul>
        <IliosCalendarMultidayEvent
          @event={{this.event}}
          @isEventSelectable={{true}}
          @selectEvent={{(noop)}}
        />
      </ul>
    `);
    assert.dom(this.element).containsText('11/11/84');
    assert.dom(this.element).containsText('Cheramie is born');
    assert.dom(this.element).containsText('Lancaster, CA');
    await a11yAudit(this.element);
  });

  test('action fires on click', async function (assert) {
    assert.expect(3);
    const event = getEvent();
    event.offering = 1;

    this.set('event', event);
    this.set('selectEvent', (value) => {
      assert.deepEqual(event, value);
    });
    await render(hbs`
      <IliosCalendarMultidayEvent
        @event={{this.event}}
        @isEventSelectable={{true}}
        @selectEvent={{this.selectEvent}}
      />
    `);
    assert.dom(this.element).containsText('Cheramie is born');
    assert.dom('[data-test-ilios-calendar-multiday-event] button').isEnabled();
    await click('[data-test-ilios-calendar-multiday-event] button');
  });

  test('action does not fire for scheduled events', async function (assert) {
    const event = getEvent();

    this.set('event', event);
    await render(hbs`
      <IliosCalendarMultidayEvent
        @event={{this.event}}
        @isEventSelectable={{true}}
        @selectEvent={{this.selectEvent}}
      />
    `);
    assert.dom(this.element).containsText('Cheramie is born');
    assert.dom('[data-test-ilios-calendar-multiday-event] button').isDisabled();
  });

  test('action does not fire for unselectableEvents events', async function (assert) {
    const event = getEvent();
    event.offering = 1;

    this.set('event', event);
    await render(hbs`
      <IliosCalendarMultidayEvent
        @event={{this.event}}
        @selectEvent={{this.selectEvent}}
      />
    `);
    assert.dom(this.element).containsText('Cheramie is born');
    assert.dom('[data-test-ilios-calendar-multiday-event] button').isDisabled();
  });
});
