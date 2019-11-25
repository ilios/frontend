import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | user profile calendar', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    const iliosConfigMock = Service.extend({
      namespace: ''
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
  });

  test('shows events for this week', async function(assert) {
    assert.expect(9);

    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.equal(params.id, 13);

      const today = moment();
      const from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
      const to = moment(today).day(6).hour(23).minute(59).second(59).format('X');

      assert.ok('from' in queryParams);
      assert.equal(queryParams.from, from);
      assert.ok('to' in queryParams);
      assert.equal(queryParams.to, to);

      const userEvents = [
        {name: 'first', startDate: today.format(), location: 123, lastModified: today.format(), prerequisites: [], postrequisites: []},
        {name: 'second', startDate: today.format(), location: 456, lastModified: today.format(), prerequisites: [], postrequisites: []},
        {name: 'third', startDate: today.format(), location: 789, lastModified: today.format(), prerequisites: [], postrequisites: []},
      ];

      return { userEvents };
    });

    const user = EmberObject.create({
      id: 13
    });
    this.set('user', user);
    await render(hbs`<UserProfileCalendar @user={{user}} />`);
    const events = '.ilios-calendar-event';
    const firstEventTitle = `${events}:nth-of-type(1) .ilios-calendar-event-name`;
    const secondEventTitle = `${events}:nth-of-type(2) .ilios-calendar-event-name`;
    const thirdEventTitle = `${events}:nth-of-type(3) .ilios-calendar-event-name`;
    await settled();

    assert.dom(firstEventTitle).hasText('first');
    assert.dom(secondEventTitle).hasText('second');
    assert.dom(thirdEventTitle).hasText('third');
  });

  test('clicking forward goes to next week', async function(assert) {
    assert.expect(12);

    let called = 0;
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.equal(params.id, 13);
      if (called === 0) {
        const today = moment();
        const from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
        const to = moment(today).day(6).hour(23).minute(59).second(59).format('X');

        assert.ok('from' in queryParams);
        assert.equal(queryParams.from, from);
        assert.ok('to' in queryParams);
        assert.equal(queryParams.to, to);
      }
      if (called === 1) {
        const nextWeek = moment().add(1, 'week');
        const from = moment(nextWeek).day(0).hour(0).minute(0).second(0).format('X');
        const to = moment(nextWeek).day(6).hour(23).minute(59).second(59).format('X');

        assert.ok('from' in queryParams);
        assert.equal(queryParams.from, from);
        assert.ok('to' in queryParams);
        assert.equal(queryParams.to, to);
      }

      called++;
      return { userEvents: [] };
    });
    const user = EmberObject.create({
      id: 13
    });
    this.set('user', user);
    await render(hbs`<UserProfileCalendar @user={{user}} />`);
    const picker = '.calendar-time-picker li';
    const goForward = `${picker}:nth-of-type(3)`;
    await click(goForward);
    await settled();
  });

  test('clicking backward goes to last week', async function(assert) {
    assert.expect(12);
    let called = 0;
    this.server.get(`/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.equal(params.id, 13);
      if (called === 0) {
        const today = moment();
        const from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
        const to = moment(today).day(6).hour(23).minute(59).second(59).format('X');

        assert.ok('from' in queryParams);
        assert.equal(queryParams.from, from);
        assert.ok('to' in queryParams);
        assert.equal(queryParams.to, to);
      }
      if (called === 1) {
        const lastWeek = moment().subtract(1, 'week');
        const from = moment(lastWeek).day(0).hour(0).minute(0).second(0).format('X');
        const to = moment(lastWeek).day(6).hour(23).minute(59).second(59).format('X');

        assert.ok('from' in queryParams);
        assert.equal(queryParams.from, from);
        assert.ok('to' in queryParams);
        assert.equal(queryParams.to, to);
      }

      called++;
      return { userEvents: [] };
    });

    const user = EmberObject.create({
      id: 13
    });
    this.set('user', user);
    await render(hbs`<UserProfileCalendar @user={{user}} />`);
    const picker = '.calendar-time-picker li';
    const goBack = `${picker}:nth-of-type(1)`;
    await click(goBack);
    await settled();
  });
});
