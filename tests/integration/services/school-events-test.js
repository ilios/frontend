import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Service | school events', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('getEvents', async function (assert) {
    assert.expect(21);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21',
      school: 7,
      prerequisites: [],
      postrequisites: [],
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02',
      school: 7,
      prerequisites: [],
      postrequisites: [],
    };
    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);

    this.server.get(`/api/schoolevents/:id`, (scheme, { params, queryParams }) => {
      assert.ok('id' in params);
      assert.strictEqual(parseInt(params.id, 10), 7);
      assert.ok('from' in queryParams);
      assert.ok('to' in queryParams);
      assert.strictEqual(parseInt(queryParams.from, 10), from.unix());
      assert.strictEqual(parseInt(queryParams.to, 10), to.unix());

      return { events: [event1, event2] };
    });
    const schoolId = 7;
    const subject = this.owner.lookup('service:school-events');
    const events = await subject.getEvents(schoolId, from.unix(), to.unix());
    assert.strictEqual(events.length, 2);
    assert.strictEqual(events[0].ilmSession, event2.ilmSession);
    assert.strictEqual(events[0].startDate, event2.startDate);
    assert.strictEqual(events[0].school, event2.school);
    assert.deepEqual(events[0].prerequisites, event2.prerequisites);
    assert.deepEqual(events[0].postrequisites, event2.postrequisites);
    assert.strictEqual(events[0].slug, 'S0720080902I3');
    assert.notOk(events[0].isBlanked);

    assert.strictEqual(events[1].offering, event1.offering);
    assert.strictEqual(events[1].startDate, event1.startDate);
    assert.strictEqual(events[1].school, event1.school);
    assert.deepEqual(events[1].prerequisites, event1.prerequisites);
    assert.deepEqual(events[1].postrequisites, event1.postrequisites);
    assert.strictEqual(events[1].slug, 'S0720110421O1');
    assert.notOk(events[1].isBlanked);
  });

  test('getEvents - with configured namespace', async function (assert) {
    assert.expect(4);
    const iliosConfigMock = Service.extend({
      apiNameSpace: 'geflarknik',
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);

    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    this.server.get(`/geflarknik/schoolevents/:id`, (scheme, { params, queryParams }) => {
      assert.strictEqual(parseInt(params.id, 10), 3);
      assert.strictEqual(parseInt(queryParams.from, 10), from.unix());
      assert.strictEqual(parseInt(queryParams.to, 10), to.unix());
      return { events: [] };
    });
    const subject = this.owner.lookup('service:school-events');
    const schoolId = 3;
    const events = await subject.getEvents(schoolId, from.unix(), to.unix());
    assert.strictEqual(events.length, 0);
  });

  test('getEventForSlug - offering', async function (assert) {
    assert.expect(10);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21',
      school: 7,
      prerequisites: [],
      postrequisites: [],
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02',
      school: 7,
      prerequisites: [],
      postrequisites: [],
    };
    this.server.get(`/api/schoolevents/:id`, (scheme, { params, queryParams }) => {
      const from = moment('20110421', 'YYYYMMDD').hour(0);
      const to = from.clone().hour(24);
      assert.strictEqual(parseInt(params.id, 10), 7);
      assert.strictEqual(parseInt(queryParams.from, 10), from.unix());
      assert.strictEqual(parseInt(queryParams.to, 10), to.unix());

      return { events: [event1, event2] };
    });

    const subject = this.owner.lookup('service:school-events');
    const event = await subject.getEventForSlug('S0720110421O1');
    assert.strictEqual(event.offering, event1.offering);
    assert.strictEqual(event.startDate, event1.startDate);
    assert.strictEqual(event.school, event1.school);
    assert.deepEqual(event.prerequisites, event1.prerequisites);
    assert.deepEqual(event.postrequisites, event1.postrequisites);
    assert.strictEqual(event.slug, 'S0720110421O1');
    assert.notOk(event.isBlanked);
  });

  test('getEventForSlug - ILM', async function (assert) {
    assert.expect(10);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21',
      school: 7,
      prerequisites: [],
      postrequisites: [],
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02',
      school: 7,
      prerequisites: [],
      postrequisites: [],
    };
    this.server.get(`/api/schoolevents/:id`, (scheme, { params, queryParams }) => {
      const from = moment('20080902', 'YYYYMMDD').hour(0);
      const to = from.clone().hour(24);
      assert.strictEqual(parseInt(params.id, 10), 7);
      assert.strictEqual(parseInt(queryParams.from, 10), from.unix());
      assert.strictEqual(parseInt(queryParams.to, 10), to.unix());

      return { events: [event1, event2] };
    });

    const subject = this.owner.lookup('service:school-events');
    const event = await subject.getEventForSlug('S0720080902I3');
    assert.strictEqual(event.ilmSession, event2.ilmSession);
    assert.strictEqual(event.startDate, event2.startDate);
    assert.strictEqual(event.school, event2.school);
    assert.deepEqual(event.prerequisites, event2.prerequisites);
    assert.deepEqual(event.postrequisites, event2.postrequisites);
    assert.strictEqual(event.slug, 'S0720080902I3');
    assert.notOk(event.isBlanked);
  });
});
