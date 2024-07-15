import Service from '@ember/service';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/dashboard/week';
import { freezeDateAt, unfreezeDate } from 'ilios-common';

module('Integration | Component | dashboard/week', function (hooks) {
  setupRenderingTest(hooks);
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

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('it renders with events', async function (assert) {
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
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');

    await render(hbs`<Dashboard::Week />
`);
    const expectedTitle = this.getTitle();
    assert.strictEqual(component.weeklyLink, 'All Weeks');
    assert.strictEqual(component.weekGlance.title, expectedTitle);
    assert.strictEqual(component.weekGlance.events.length, 0);
  });

  test('right week on sunday #5308', async function (assert) {
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');
    freezeDateAt(DateTime.fromObject({ year: 2024, month: 3, day: 10 }).toJSDate());

    await render(hbs`<Dashboard::Week />`);
    assert.strictEqual(component.weekGlance.title, 'March 10-16 Week at a Glance');
  });

  test('right week on monday #5308', async function (assert) {
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');
    freezeDateAt(DateTime.fromObject({ year: 2023, month: 8, day: 7 }).toJSDate());

    await render(hbs`<Dashboard::Week />`);
    assert.strictEqual(component.weekGlance.title, 'August 6-12 Week at a Glance');
  });

  test('right week on tuesday #5308', async function (assert) {
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');
    freezeDateAt(DateTime.fromObject({ year: 2022, month: 12, day: 6 }).toJSDate());
    await render(hbs`<Dashboard::Week />`);
    assert.strictEqual(component.weekGlance.title, 'December 4-10 Week at a Glance');
  });

  test('right week on wednesday #5308', async function (assert) {
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');
    freezeDateAt(DateTime.fromObject({ year: 2022, month: 7, day: 13 }).toJSDate());
    await render(hbs`<Dashboard::Week />`);
    assert.strictEqual(component.weekGlance.title, 'July 10-16 Week at a Glance');
  });

  test('right week on thursday #5308', async function (assert) {
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');
    freezeDateAt(DateTime.fromObject({ year: 2021, month: 5, day: 13 }).toJSDate());
    await render(hbs`<Dashboard::Week />`);
    assert.strictEqual(component.weekGlance.title, 'May 9-15 Week at a Glance');
  });

  test('right week on friday #5308', async function (assert) {
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');
    freezeDateAt(DateTime.fromObject({ year: 2021, month: 9, day: 24 }).toJSDate());
    await render(hbs`<Dashboard::Week />`);
    assert.strictEqual(component.weekGlance.title, 'September 19-25 Week at a Glance');
  });

  test('right week on saturday #5308', async function (assert) {
    class UserEvents extends Service {
      async getEvents() {
        return [];
      }
    }
    this.owner.register('service:user-events', UserEvents);
    this.userEvents = this.owner.lookup('service:user-events');
    freezeDateAt(DateTime.fromObject({ year: 2022, month: 7, day: 30 }).toJSDate());
    await render(hbs`<Dashboard::Week />`);
    assert.strictEqual(component.weekGlance.title, 'July 24-30 Week at a Glance');
  });
});
