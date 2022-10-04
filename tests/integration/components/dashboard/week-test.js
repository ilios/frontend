import Service from '@ember/service';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/dashboard/week';

module('Integration | Component | dashboard/week', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  const today = DateTime.fromObject({ hour: 8 });

  hooks.beforeEach(function () {
    this.getTitle = function () {
      const ld = this.owner.lookup('service:locale-days');
      const startOfWeek = DateTime.fromJSDate(ld.firstDayOfDateWeek(today.toJSDate()));
      const endOfWeek = DateTime.fromJSDate(ld.lastDayOfDateWeek(today.toJSDate()));

      let expectedTitle;
      if (!startOfWeek.hasSame(endOfWeek, 'month')) {
        const from = startOfWeek.toFormat('MMMM d');
        const to = endOfWeek.toFormat('MMMM d');
        expectedTitle = `${from} - ${to}`;
      } else {
        const from = startOfWeek.toFormat('MMMM d');
        const to = endOfWeek.toFormat('d');
        expectedTitle = `${from}-${to}`;
      }
      expectedTitle += ' Week at a Glance';

      return expectedTitle;
    };
  });

  test('it renders with events', async function (assert) {
    assert.expect(5);
    this.server.create('userevent', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      offering: 1,
    });
    this.server.create('userevent', {
      name: 'Finding the Point in Life',
      startDate: today.toISO(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      ilmSession: 1,
    });
    this.server.create('userevent', {
      name: 'Blank',
      isBlanked: true,
    });
    this.server.create('userevent', {
      name: 'Not Published',
      isBlanked: false,
      isPublished: false,
      isScheduled: false,
    });
    this.server.create('userevent', {
      name: 'Scheduled',
      isBlanked: false,
      isPublished: true,
      isScheduled: true,
    });

    const { userevents } = this.server.db;
    class UserEvents extends Service {
      async getEvents() {
        return userevents.slice();
      }
    }
    this.owner.register('service:user-events', UserEvents);

    await render(hbs`<Dashboard::Week />`);
    const expectedTitle = this.getTitle();
    assert.strictEqual(component.weeklyLink, 'All Weeks');
    assert.strictEqual(component.weekGlance.title, expectedTitle);
    assert.strictEqual(component.weekGlance.events.length, 2, 'Blank events are not shown');
    assert.strictEqual(component.weekGlance.events[0].title, 'Learn to Learn');
    assert.strictEqual(component.weekGlance.events[1].title, 'Finding the Point in Life');
  });

  test('it renders blank', async function (assert) {
    assert.expect(3);
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`<Dashboard::Week />`);
    const expectedTitle = this.getTitle();
    assert.strictEqual(component.weeklyLink, 'All Weeks');
    assert.strictEqual(component.weekGlance.title, expectedTitle);
    assert.strictEqual(component.weekGlance.events.length, 0);
  });
});
