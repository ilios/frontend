import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Service | user events', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const MockCurrentUserService = Service.extend({
      async getModel() {
        return EmberObject.create({
          id: 1,
        });
      },
    });
    this.owner.register('service:current-user', MockCurrentUserService);
    this.currentUser = this.owner.lookup('service:current-user');
  });

  test('getEvents', async function (assert) {
    assert.expect(17);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21',
      prerequisites: [],
      postrequisites: [],
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02',
      prerequisites: [],
      postrequisites: [],
    };
    const event3 = {
      startDate: '2015-11-20',
      prerequisites: [],
      postrequisites: [],
    };
    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    this.server.get(`/api/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.strictEqual(params.id, 1);
      assert.ok('from' in queryParams);
      assert.ok('to' in queryParams);
      assert.strictEqual(queryParams.from, from.unix());
      assert.strictEqual(queryParams.to, to.unix());

      return { userEvents: [event1, event2, event3] };
    });

    const subject = this.owner.lookup('service:user-events');
    const events = await subject.getEvents(from.unix(), to.unix());
    assert.strictEqual(events.length, 3);
    assert.strictEqual(events[0].ilmSession, event2.ilmSession);
    assert.strictEqual(events[0].startDate, event2.startDate);
    assert.false(events[0].isBlanked);
    assert.strictEqual(events[0].slug, 'U20080902I3');
    assert.false(events[1].isBlanked);
    assert.strictEqual(events[1].slug, 'U20110421O1');
    assert.strictEqual(events[1].offering, event1.offering);
    assert.strictEqual(events[1].startDate, event1.startDate);
    assert.true(events[2].isBlanked);
    assert.strictEqual(events[2].startDate, event3.startDate);
  });

  test('getEvents - no user', async function (assert) {
    assert.expect(1);
    this.currentUser.reopen({
      async getModel() {
        return EmberObject.create({
          id: 1,
        });
      },
    });
    const subject = this.owner.lookup('service:user-events');
    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    const events = await subject.getEvents(from.unix(), to.unix());
    assert.strictEqual(events.length, 0);
  });

  test('getEvents - with configured namespace', async function (assert) {
    assert.expect(2);
    const iliosConfigMock = Service.extend({
      apiNameSpace: 'geflarknik',
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    this.server.get(`/geflarknik/userevents/:id`, (scheme, { params }) => {
      assert.strictEqual(params.id, 1);
      return { userEvents: [] };
    });
    const subject = this.owner.lookup('service:user-events');

    const events = await subject.getEvents(from.unix(), to.unix());
    assert.strictEqual(events.length, 0);
  });

  test('getEvents - sorted by name for events occupying same time slot', async function (assert) {
    assert.expect(4);
    const event1 = {
      name: 'Zeppelin',
      offering: 1,
      startDate: '2011-04-21',
      prerequisites: [],
      postrequisites: [],
    };
    const event2 = {
      name: 'Aardvark',
      offering: 2,
      startDate: '2011-04-21',
      prerequisites: [],
      postrequisites: [],
    };

    const from = moment('20110421', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    this.server.get(`/api/userevents/:id`, (scheme, { params }) => {
      assert.strictEqual(params.id, 1);
      return { userEvents: [event1, event2] };
    });

    const subject = this.owner.lookup('service:user-events');
    const events = await subject.getEvents(from.unix(), to.unix());
    assert.strictEqual(events.length, 2);
    assert.strictEqual(events[0].name, event2.name);
    assert.strictEqual(events[1].name, event1.name);
  });

  test('getEventsForSlug - offering', async function (assert) {
    assert.expect(4);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21',
      prerequisites: [],
      postrequisites: [],
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02',
      prerequisites: [],
      postrequisites: [],
    };

    this.server.get(`/api/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.strictEqual(params.id, 1);
      const from = moment('20130121', 'YYYYMMDD').hour(0);
      const to = from.clone().hour(24);
      assert.strictEqual(queryParams.from, from.unix());
      assert.strictEqual(queryParams.to, to.unix());

      return { userEvents: [event1, event2] };
    });

    const subject = this.owner.lookup('service:user-events');
    const event = await subject.getEventForSlug('U20130121O1');
    assert.strictEqual(event.offering, event1.offering);
  });

  test('getEventsForSlug - ILM', async function (assert) {
    assert.expect(4);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21',
      prerequisites: [],
      postrequisites: [],
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02',
      prerequisites: [],
      postrequisites: [],
    };

    this.server.get(`/api/userevents/:id`, (scheme, { params, queryParams }) => {
      assert.strictEqual(params.id, 1);
      const from = moment('20130121', 'YYYYMMDD').hour(0);
      const to = from.clone().hour(24);
      assert.strictEqual(queryParams.from, from.unix());
      assert.strictEqual(queryParams.to, to.unix());

      return { userEvents: [event1, event2] };
    });

    const subject = this.owner.lookup('service:user-events');
    const event = await subject.getEventForSlug('U20130121I3');
    assert.strictEqual(event.ilmSession, event2.ilmSession);
  });
});
