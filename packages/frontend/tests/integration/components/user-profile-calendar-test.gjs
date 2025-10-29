import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import UserProfileCalendar from 'frontend/components/user-profile-calendar';

module('Integration | Component | user profile calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    class IliosConfigMock extends Service {
      namespace = '';
    }
    this.owner.register('service:iliosConfig', IliosConfigMock);
  });

  test('shows events for this week', async function (assert) {
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.step('API called');
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 13);

      const today = DateTime.fromObject({ hour: 8 });
      const { firstDayOfThisWeek, lastDayOfThisWeek } = this.owner.lookup('service:locale-days');
      const from = DateTime.fromJSDate(firstDayOfThisWeek).toUnixInteger();
      const to = DateTime.fromJSDate(lastDayOfThisWeek).toUnixInteger();

      assert.ok('from' in queryParams);
      assert.strictEqual(Number(queryParams.from), from, 'from is correct');
      assert.ok('to' in queryParams);
      assert.strictEqual(Number(queryParams.to), to, 'to is correct');

      const userEvents = [
        {
          name: 'first',
          startDate: today.toISO(),
          endDate: today.plus({ hour: 1 }).toISO(),
          location: 123,
          lastModified: today.toISO(),
          prerequisites: [],
          postrequisites: [],
        },
        {
          name: 'second',
          startDate: today.toISO(),
          endDate: today.plus({ hour: 1 }).toISO(),
          location: 456,
          lastModified: today.toISO(),
          prerequisites: [],
          postrequisites: [],
        },
        {
          name: 'third',
          startDate: today.toISO(),
          endDate: today.plus({ hour: 1 }).toISO(),
          location: 789,
          lastModified: today.toISO(),
          prerequisites: [],
          postrequisites: [],
        },
      ];

      return { userEvents };
    });

    const user = EmberObject.create({
      id: 13,
    });
    this.set('user', user);
    await render(<template><UserProfileCalendar @user={{this.user}} /></template>);
    const events = '[data-test-calendar-event]';
    const firstEventTitle = `${events}:nth-of-type(1) [data-test-name]`;
    const secondEventTitle = `${events}:nth-of-type(2) [data-test-name]`;
    const thirdEventTitle = `${events}:nth-of-type(3) [data-test-name]`;

    assert.dom(firstEventTitle).hasText('first');
    assert.dom(firstEventTitle).doesNotHaveClass('clickable');
    assert.dom(secondEventTitle).hasText('second');
    assert.dom(secondEventTitle).doesNotHaveClass('clickable');
    assert.dom(thirdEventTitle).hasText('third');
    assert.dom(thirdEventTitle).doesNotHaveClass('clickable');
    assert.verifySteps(['API called']);
  });

  test('clicking forward goes to next week', async function (assert) {
    let called = 0;
    const { firstDayOfThisWeek, lastDayOfThisWeek } = this.owner.lookup('service:locale-days');
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.step('API called');
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 13);
      assert.ok('from' in queryParams);
      assert.ok('to' in queryParams);
      const from = DateTime.fromJSDate(firstDayOfThisWeek).plus({ weeks: called }).toUnixInteger();
      const to = DateTime.fromJSDate(lastDayOfThisWeek).plus({ weeks: called }).toUnixInteger();

      assert.strictEqual(Number(queryParams.from), from);
      assert.strictEqual(Number(queryParams.to), to);

      called++;
      return { userEvents: [] };
    });
    const user = EmberObject.create({
      id: 13,
    });
    this.set('user', user);
    await render(<template><UserProfileCalendar @user={{this.user}} /></template>);
    await click('[data-test-go-forward]');
    assert.verifySteps(['API called', 'API called']);
  });

  test('clicking backward goes to last week', async function (assert) {
    let called = 0;
    const { firstDayOfThisWeek, lastDayOfThisWeek } = this.owner.lookup('service:locale-days');
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.step('API called');
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 13);
      assert.ok('from' in queryParams);
      assert.ok('to' in queryParams);

      const from = DateTime.fromJSDate(firstDayOfThisWeek).minus({ weeks: called }).toUnixInteger();
      const to = DateTime.fromJSDate(lastDayOfThisWeek).minus({ weeks: called }).toUnixInteger();

      assert.strictEqual(Number(queryParams.from), from);
      assert.strictEqual(Number(queryParams.to), to);

      called++;
      return { userEvents: [] };
    });

    const user = EmberObject.create({
      id: 13,
    });
    this.set('user', user);
    await render(<template><UserProfileCalendar @user={{this.user}} /></template>);
    await click('[data-test-go-back]');
    assert.verifySteps(['API called', 'API called']);
  });
});
