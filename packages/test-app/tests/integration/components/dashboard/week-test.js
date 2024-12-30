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

    this.setupEvents = function (events) {
      class UserEvents extends Service {
        async getEvents() {
          return events;
        }
      }
      this.owner.register('service:user-events', UserEvents);
    };

    this.testTitleOnDate = async function (assert, obj, expectedTitle) {
      const dt = DateTime.fromObject(obj);
      freezeDateAt(dt.toJSDate());
      await render(hbs`<Dashboard::Week />`);
      assert.strictEqual(
        component.weekGlance.title,
        expectedTitle,
        `correct title on ${dt.toISODate()}`,
      );
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
    this.setupEvents(userevents);

    await render(hbs`<Dashboard::Week />`);
    const expectedTitle = this.getTitle();
    assert.strictEqual(component.weeklyLink, 'All Weeks');
    assert.strictEqual(component.weekGlance.title, expectedTitle);
    assert.strictEqual(component.weekGlance.events.length, 2, 'Blank events are not shown');
    assert.strictEqual(component.weekGlance.events[0].title, 'Learn to Learn');
    assert.strictEqual(component.weekGlance.events[1].title, 'Finding the Point in Life');
  });

  test('it renders blank', async function (assert) {
    this.setupEvents([]);
    await render(hbs`<Dashboard::Week />`);
    const expectedTitle = this.getTitle();
    assert.strictEqual(component.weeklyLink, 'All Weeks');
    assert.strictEqual(component.weekGlance.title, expectedTitle);
    assert.strictEqual(component.weekGlance.events.length, 0);
  });

  test('right week on sunday #5308', async function (assert) {
    assert.expect(1);
    await this.testTitleOnDate(
      assert,
      { year: 2024, month: 3, day: 10 },
      'March 10-16 Week at a Glance',
    );
  });

  test('right week on monday #5308', async function (assert) {
    assert.expect(1);
    await this.testTitleOnDate(
      assert,
      { year: 2023, month: 8, day: 7 },
      'August 6-12 Week at a Glance',
    );
  });

  test('right week on tuesday #5308', async function (assert) {
    assert.expect(1);
    await this.testTitleOnDate(
      assert,
      { year: 2022, month: 12, day: 6 },
      'December 4-10 Week at a Glance',
    );
  });

  test('right week on wednesday #5308', async function (assert) {
    assert.expect(1);
    await this.testTitleOnDate(
      assert,
      { year: 2022, month: 7, day: 13 },
      'July 10-16 Week at a Glance',
    );
  });

  test('right week on thursday #5308', async function (assert) {
    assert.expect(1);
    await this.testTitleOnDate(
      assert,
      { year: 2021, month: 5, day: 13 },
      'May 9-15 Week at a Glance',
    );
  });

  test('right week on friday #5308', async function (assert) {
    assert.expect(1);
    await this.testTitleOnDate(
      assert,
      { year: 2021, month: 9, day: 24 },
      'September 19-25 Week at a Glance',
    );
  });

  test('right week on saturday #5308', async function (assert) {
    assert.expect(1);
    await this.testTitleOnDate(
      assert,
      { year: 2022, month: 7, day: 30 },
      'July 24-30 Week at a Glance',
    );
  });

  test('correct at the end of 2023 and the start of 2024', async function (assert) {
    assert.expect(7);
    this.setupEvents([]);
    const title = 'December 31 - January 6 Week at a Glance';
    await this.testTitleOnDate(assert, { year: 2023, month: 12, day: 31 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 1, day: 1 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 1, day: 2 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 1, day: 3 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 1, day: 4 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 1, day: 5 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 1, day: 6 }, title);
  });

  test('correct at the end of 2024 and start of 2025', async function (assert) {
    assert.expect(7);
    this.setupEvents([]);
    const title = 'December 29 - January 4 Week at a Glance';
    await this.testTitleOnDate(assert, { year: 2024, month: 12, day: 29 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 12, day: 30 }, title);
    await this.testTitleOnDate(assert, { year: 2024, month: 12, day: 31 }, title);
    await this.testTitleOnDate(assert, { year: 2025, month: 1, day: 1 }, title);
    await this.testTitleOnDate(assert, { year: 2025, month: 1, day: 2 }, title);
    await this.testTitleOnDate(assert, { year: 2025, month: 1, day: 3 }, title);
    await this.testTitleOnDate(assert, { year: 2025, month: 1, day: 4 }, title);
  });

  test('correct at the end of 2025 and start of 2026', async function (assert) {
    assert.expect(7);
    this.setupEvents([]);
    const title = 'December 28 - January 3 Week at a Glance';
    await this.testTitleOnDate(assert, { year: 2025, month: 12, day: 28 }, title);
    await this.testTitleOnDate(assert, { year: 2025, month: 12, day: 29 }, title);
    await this.testTitleOnDate(assert, { year: 2025, month: 12, day: 30 }, title);
    await this.testTitleOnDate(assert, { year: 2025, month: 12, day: 31 }, title);
    await this.testTitleOnDate(assert, { year: 2026, month: 1, day: 1 }, title);
    await this.testTitleOnDate(assert, { year: 2026, month: 1, day: 2 }, title);
    await this.testTitleOnDate(assert, { year: 2026, month: 1, day: 3 }, title);
  });

  test('correct on some random day', async function (assert) {
    assert.expect(1);
    this.setupEvents([]);
    await this.testTitleOnDate(
      assert,
      { year: 2005, month: 6, day: 24 },
      'June 19-25 Week at a Glance',
    );
  });
});
