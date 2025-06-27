import Service from '@ember/service';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, settled, click } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/week-glance';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { setLocale, setupIntl } from 'ember-intl/test-support';
import WeekGlance from 'ilios-common/components/week-glance';
import formatDate from 'ember-intl/helpers/format-date';

module('Integration | Component | week-glance', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'en-us');

  const testDate = DateTime.fromObject({
    year: 2017,
    month: 1,
    day: 19,
    hour: 0,
    minute: 0,
    second: 0,
  });

  const setupUserEvents = (context) => {
    class Mock extends Service {
      async getEvents() {
        return context.server.db.userevents;
      }
    }

    context.owner.register('service:user-events', Mock);
  };

  const setupBlankEvents = (context) => {
    class Mock extends Service {
      async getEvents() {
        return [];
      }
    }

    context.owner.register('service:user-events', Mock);
  };

  hooks.beforeEach(function () {
    this.server.create('userevent', {
      name: 'Learn to Learn',
      startDate: testDate.toISO(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      offering: 1,
      slug: 'a',
    });
    this.server.create('userevent', {
      name: 'Finding the Point in Life',
      startDate: testDate.plus({ day: 1 }).toISO(),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      ilmSession: 1,
      slug: 'b',
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
    this.server.create('userevent', {
      name: 'Schedule some materials',
      startDate: testDate.plus({ day: 1 }).toISO(),
      location: 'Room 123',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      offering: 1,
      slug: 'c',
    });

    this.getTitle = function (fullTitle) {
      this.intl = this.owner.lookup('service:intl');
      const ld = this.owner.lookup('service:locale-days');
      const startOfWeek = DateTime.fromJSDate(ld.firstDayOfDateWeek(testDate.toJSDate()));
      const endOfWeek = DateTime.fromJSDate(ld.lastDayOfDateWeek(testDate.toJSDate()));

      let expectedTitle;
      if (startOfWeek.month != endOfWeek.month) {
        const from =
          this.intl.formatDate(startOfWeek, { month: 'long' }) + ' ' + startOfWeek.toFormat('d');
        const to =
          this.intl.formatDate(endOfWeek, { month: 'long' }) + ' ' + endOfWeek.toFormat('d');
        expectedTitle = `${from} - ${to}`;
      } else {
        const from =
          this.intl.formatDate(startOfWeek, { month: 'long' }) + ' ' + startOfWeek.toFormat('d');
        const to = endOfWeek.toFormat('d');
        expectedTitle = `${from}-${to}`;
      }
      if (fullTitle) {
        expectedTitle += ' ' + this.intl.t('general.weekAtAGlance');
      }

      return expectedTitle;
    };
  });

  test('it renders with events', async function (assert) {
    setupUserEvents(this);
    this.set('today', testDate.toJSDate());
    this.set('week', testDate.weekNumber);
    await render(
      <template>
        <WeekGlance
          @collapsible={{false}}
          @collapsed={{false}}
          @showFullTitle={{true}}
          @year={{formatDate this.today year="numeric"}}
          @week={{this.week}}
        />
      </template>,
    );

    assert.strictEqual(component.title, this.getTitle(true));
    assert.strictEqual(component.eventsByDate.length, 2);
    assert.strictEqual(component.eventsByDate[0].events.length, 1);
    assert.strictEqual(component.eventsByDate[0].events[0].title, 'Learn to Learn');
    assert.strictEqual(component.eventsByDate[1].events.length, 2);
    assert.strictEqual(component.eventsByDate[1].events[0].title, 'Finding the Point in Life');
    assert.strictEqual(component.eventsByDate[1].events[1].title, 'Schedule some materials');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders blank', async function (assert) {
    setupBlankEvents(this);

    this.set('today', testDate.toJSDate());
    this.set('week', testDate.weekNumber);
    await render(
      <template>
        <WeekGlance
          @collapsible={{false}}
          @collapsed={{false}}
          @showFullTitle={{true}}
          @year={{formatDate this.today year="numeric"}}
          @week={{this.week}}
        />
      </template>,
    );
    const title = '[data-test-week-title]';
    const body = 'p';
    const expectedTitle = this.getTitle(true);

    await settled();

    assert.strictEqual(
      this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ''),
      expectedTitle.replace(/[\t\n\s]+/g, ''),
    );
    assert.dom(this.element.querySelector(body)).hasText('None');
  });

  test('renders short title', async function (assert) {
    setupBlankEvents(this);

    this.set('today', testDate.toJSDate());
    this.set('week', testDate.weekNumber);
    await render(
      <template>
        <WeekGlance
          @collapsible={{false}}
          @collapsed={{false}}
          @showFullTitle={{false}}
          @year={{formatDate this.today year="numeric"}}
          @week={{this.week}}
        />
      </template>,
    );
    const title = '[data-test-week-title]';
    const expectedTitle = this.getTitle(false);
    await settled();

    assert.strictEqual(
      this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ''),
      expectedTitle.replace(/[\t\n\s]+/g, ''),
    );
  });

  test('it renders collapsed', async function (assert) {
    setupBlankEvents(this);

    this.set('today', testDate.toJSDate());
    this.set('week', testDate.weekNumber);
    await render(
      <template>
        <WeekGlance
          @collapsible={{true}}
          @collapsed={{true}}
          @showFullTitle={{false}}
          @year={{formatDate this.today year="numeric"}}
          @week={{this.week}}
        />
      </template>,
    );
    const title = '[data-test-week-title]';
    const body = 'p';
    const expectedTitle = this.getTitle(false);

    await settled();

    assert.strictEqual(
      this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ''),
      expectedTitle.replace(/[\t\n\s]+/g, ''),
    );
    assert.strictEqual(this.element.querySelectorAll(body).length, 0);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click to expand', async function (assert) {
    assert.expect(1);
    setupBlankEvents(this);

    this.set('today', testDate.toJSDate());
    this.set('toggle', (value) => {
      assert.ok(value);
    });
    await render(
      <template>
        <WeekGlance
          @collapsible={{true}}
          @collapsed={{true}}
          @showFullTitle={{false}}
          @year={{formatDate this.today year="numeric"}}
          @week={{this.week}}
          @toggleCollapsed={{this.toggle}}
        />
      </template>,
    );
    const title = '[data-test-week-title]';
    await settled();
    await click(title);
  });

  test('click to collapse', async function (assert) {
    assert.expect(1);
    setupBlankEvents(this);

    this.set('today', testDate.toJSDate());
    this.set('toggle', (value) => {
      assert.notOk(value);
    });
    await render(
      <template>
        <WeekGlance
          @collapsible={{true}}
          @collapsed={{false}}
          @showFullTitle={{false}}
          @year={{formatDate this.today year="numeric"}}
          @week={{this.week}}
          @toggleCollapsed={{this.toggle}}
        />
      </template>,
    );
    const title = '[data-test-week-title]';
    await settled();
    await click(title);
  });

  test('changing passed properties re-renders', async function (assert) {
    assert.expect(8);
    const nextYear = testDate.plus({ years: 1 });
    let count = 1;
    const service = this.owner.lookup('service:locale-days');
    class BlankEventsMock extends Service {
      async getEvents(fromStamp, toStamp) {
        const from = DateTime.fromSeconds(fromStamp);
        const to = DateTime.fromSeconds(toStamp);
        const fromTestDate = DateTime.fromJSDate(service.firstDayOfDateWeek(testDate.toJSDate()));
        const toTestDate = DateTime.fromJSDate(service.lastDayOfDateWeek(testDate.toJSDate()));
        switch (count) {
          case 1:
            assert.ok(from.hasSame(fromTestDate, 'day'), 'From is at the start of test date week.');
            assert.ok(to.hasSame(toTestDate, 'day'), 'To is at the end of test date week.');
            break;
          case 2:
            assert.ok(from.hasSame(nextYear, 'year'), 'From-date has same year as next year.');
            assert.ok(to.hasSame(nextYear, 'year'), 'To-date has same year as next year.');
            // comparing weeks needs some wiggle room as dates may be shifting across week lines.
            assert.ok(
              1 >= Math.abs(from.weekNumber - nextYear.weekNumber),
              'From-date is at the most one week off from next year.',
            );
            assert.ok(
              1 >= Math.abs(to.weekNumber - nextYear.weekNumber),
              'To-date has is at the most one week off from next year.',
            );
            break;
          default:
            assert.notOk(true, 'Called too many times');
        }
        count++;
        return [];
      }
    }
    this.owner.register('service:user-events', BlankEventsMock);

    this.set('year', testDate.year);
    this.set('week', testDate.weekNumber);
    await render(
      <template>
        <WeekGlance
          @collapsible={{false}}
          @collapsed={{false}}
          @showFullTitle={{true}}
          @year={{this.year}}
          @week={{this.week}}
        />
      </template>,
    );
    const title = '[data-test-week-title]';
    const body = 'p';
    const expectedTitle = this.getTitle(true);

    await settled();

    assert.strictEqual(
      this.element.querySelector(title).textContent.replace(/[\t\n\s]+/g, ''),
      expectedTitle.replace(/[\t\n\s]+/g, ''),
    );
    assert.dom(this.element.querySelector(body)).hasText('None');

    this.set('year', nextYear.year);

    return settled();
  });

  test('title month is properly translated', async function (assert) {
    this.set('today', testDate.toJSDate());
    this.set('week', testDate.weekNumber);
    await render(
      <template>
        <WeekGlance
          @collapsible={{true}}
          @collapsed={{true}}
          @showFullTitle={{true}}
          @year={{formatDate this.today year="numeric"}}
          @week={{this.week}}
        />
      </template>,
    );

    assert.strictEqual(component.title, this.getTitle(true));

    await setLocale('es');
    assert.strictEqual(component.title, this.getTitle(true));

    await setLocale('fr');
    assert.strictEqual(component.title, this.getTitle(true));
  });
});
