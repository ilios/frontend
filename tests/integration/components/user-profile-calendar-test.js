import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
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

      const today = moment();
      const from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
      const to = moment(today).day(6).hour(23).minute(59).second(59).format('X');

      assert.ok('from' in queryParams);
      assert.strictEqual(queryParams.from, from);
      assert.ok('to' in queryParams);
      assert.strictEqual(queryParams.to, to);

      const userEvents = [
        {
          name: 'first',
          startDate: today.format(),
          location: 123,
          lastModified: today.format(),
          prerequisites: [],
          postrequisites: [],
        },
        {
          name: 'second',
          startDate: today.format(),
          location: 456,
          lastModified: today.format(),
          prerequisites: [],
          postrequisites: [],
        },
        {
          name: 'third',
          startDate: today.format(),
          location: 789,
          lastModified: today.format(),
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
    await render(hbs`<UserProfileCalendar @user={{user}} />`);
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
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 13);
      assert.ok('from' in queryParams);
      assert.ok('to' in queryParams);
      let to, from;
      if (called === 0) {
        const today = moment();
        from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
        to = moment(today).day(6).hour(23).minute(59).second(59).format('X');
      }
      if (called === 1) {
        const nextWeek = moment().add(1, 'week');
        from = moment(nextWeek).day(0).hour(0).minute(0).second(0).format('X');
        to = moment(nextWeek).day(6).hour(23).minute(59).second(59).format('X');
      }

      assert.strictEqual(queryParams.from, from);
      assert.strictEqual(queryParams.to, to);

      called++;
      return { userEvents: [] };
    });
    const user = EmberObject.create({
      id: 13,
    });
    this.set('user', user);
    await render(hbs`<UserProfileCalendar @user={{user}} />`);
    await click('[data-test-go-forward]');
  });

  test('clicking backward goes to last week', async function (assert) {
    assert.expect(12);
    let called = 0;
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 13);
      assert.ok('from' in queryParams);
      assert.ok('to' in queryParams);

      let to, from;
      if (called === 0) {
        const today = moment();
        from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
        to = moment(today).day(6).hour(23).minute(59).second(59).format('X');
      }
      if (called === 1) {
        const lastWeek = moment().subtract(1, 'week');
        from = moment(lastWeek).day(0).hour(0).minute(0).second(0).format('X');
        to = moment(lastWeek).day(6).hour(23).minute(59).second(59).format('X');
      }
      assert.strictEqual(queryParams.from, from);
      assert.strictEqual(queryParams.to, to);

      called++;
      return { userEvents: [] };
    });

    const user = EmberObject.create({
      id: 13,
    });
    this.set('user', user);
    await render(hbs`<UserProfileCalendar @user={{user}} />`);
    await click('[data-test-go-back]');
  });
});
