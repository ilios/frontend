import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | user profile calendar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const iliosConfigMock = Service.extend({
      namespace: '',
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
  });

  test('shows events for this week', async function (assert) {
    assert.expect(12);

    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 13);

      const today = DateTime.fromObject({ hour: 8 });
      const { firstDayOfThisWeek, lastDayOfThisWeek } = this.owner.lookup('service:locale-days');
      const from = DateTime.fromJSDate(firstDayOfThisWeek).toUnixInteger();
      const to = DateTime.fromJSDate(lastDayOfThisWeek).toUnixInteger();

      assert.ok('from' in queryParams);
      assert.strictEqual(Number(queryParams.from), from);
      assert.ok('to' in queryParams);
      assert.strictEqual(Number(queryParams.to), to);

      const userEvents = [
        {
          name: 'first',
          startDate: today.toJSDate(),
          location: 123,
          lastModified: today.toJSDate(),
          prerequisites: [],
          postrequisites: [],
        },
        {
          name: 'second',
          startDate: today.toJSDate(),
          location: 456,
          lastModified: today.toJSDate(),
          prerequisites: [],
          postrequisites: [],
        },
        {
          name: 'third',
          startDate: today.toJSDate(),
          location: 789,
          lastModified: today.toJSDate(),
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
    await render(hbs`<UserProfileCalendar @user={{this.user}} />`);
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
  });

  test('clicking forward goes to next week', async function (assert) {
    assert.expect(12);

    let called = 0;
    const { firstDayOfThisWeek, lastDayOfThisWeek } = this.owner.lookup('service:locale-days');
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
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
    await render(hbs`<UserProfileCalendar @user={{this.user}} />`);
    await click('[data-test-go-forward]');
  });

  test('clicking backward goes to last week', async function (assert) {
    assert.expect(12);
    let called = 0;
    const { firstDayOfThisWeek, lastDayOfThisWeek } = this.owner.lookup('service:locale-days');
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
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
    await render(hbs`<UserProfileCalendar @user={{this.user}} />`);
    await click('[data-test-go-back]');
  });
});
