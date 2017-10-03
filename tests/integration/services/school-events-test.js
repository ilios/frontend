import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import moment from 'moment';

const { RSVP, run, Service } = Ember;
const { resolve } = RSVP;

moduleFor('service:school-events', 'Integration | Service | school events', {
  integration: true,
  beforeEach() {
    const MockCommonAjaxService = Service.extend({
      request() {
        return resolve({ events: [] });
      }
    });
    this.register('service:commonAjax', MockCommonAjaxService);
    this.inject.service('commonAjax', { as: 'commonAjax' });

    const MockIliosConfigService = Service.extend({
      apiNameSpace: ''
    });
    this.register('service:iliosConfig', MockIliosConfigService);
    this.inject.service('iliosConfig', { as: 'iliosConfig' });
  }
});

test('getEvents', async function(assert){
  assert.expect(6);
  let event1 = {
    offering: 1,
    startDate: '2011-04-21',
    school: 7
  };
  let event2 = {
    ilmSession: 3,
    startDate: '2008-09-02',
    school: 7
  };
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/schoolevents/7?from=1425542400000&to=1425628800000');
      return resolve({ events: [ event1, event2 ] });
    }
  });
  const from = moment('20150305', 'YYYYMMDD').hour(0);
  const to = from.clone().hour(24);
  const schoolId = 7;
  const subject = this.subject();
  run(async () => {
    const events = await subject.getEvents(schoolId, from, to);
    assert.equal(events.length, 2);
    assert.equal(events[0], event2);
    assert.equal(events[0].slug, 'S0720080902I3');
    assert.equal(events[1], event1);
    assert.equal(events[1].slug, 'S0720110421O1');
  });
});

test('getEvents - with configured namespace', async function(assert){
  assert.expect(2);
  this.iliosConfig.reopen({
    apiNameSpace: 'geflarknik'
  });
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/geflarknik/schoolevents/3?from=1425542400000&to=1425628800000');
      return resolve({ events: [] });
    }
  });
  const subject = this.subject();
  const schoolId = 3;
  let from = moment('20150305', 'YYYYMMDD').hour(0);
  let to = from.clone().hour(24);
  run( async () => {
    let events = await subject.getEvents(schoolId, from, to);
    assert.equal(events.length, 0);
  });
});

test('getEventForSlug - offering', async function(assert){
  assert.expect(2);
  let event1 = {
    offering: 1,
    startDate: '2011-04-21',
    school: 7,
  };
  let event2 = {
    ilmSession: 3,
    startDate: '2008-09-02',
    school: 7
  };
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/schoolevents/7?from=1303369200&to=1303455600');
      return resolve({ events: [event1, event2] });
    }
  });
  const subject = this.subject();
  run( async () => {
    let event = await subject.getEventForSlug('S0720110421O1');
    assert.equal(event, event1);
  });
});

test('getEventForSlug - ILM', async function(assert){
  assert.expect(2);
  let event1 = {
    offering: 1,
    startDate: '2011-04-21',
    school: 7,
  };
  let event2 = {
    ilmSession: 3,
    startDate: '2008-09-02',
    school: 7
  };
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/schoolevents/7?from=1220338800&to=1220425200');
      return resolve({ events: [event1, event2] });
    }
  });
  const subject = this.subject();
  run( async () => {
    let event = await subject.getEventForSlug('S0720080902I3');
    assert.equal(event, event2);
  });
});

test('getSlugForEvent - offering', function(assert) {
  assert.expect(1);
  const service = this.subject();
  const event = {
    startDate: moment('2013-01-21').toDate(),
    offering: 1,
    school: 2
  };
  assert.equal(service.getSlugForEvent(event), 'S0220130121O1');
});

test('getSlugForEvent - ILM', function(assert) {
  assert.expect(1);
  const service = this.subject();
  const event = {
    startDate: moment('2014-10-30').toDate(),
    ilmSession: 1,
    school: 10
  };
  assert.equal(service.getSlugForEvent(event), 'S1020141030I1');
});
