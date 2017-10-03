import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import moment from 'moment';

const { Object: EmberObject, RSVP, run, Service } = Ember;
const { resolve } = RSVP;

moduleFor('service:user-events', 'Unit | Service | user events', {
  integration: true,
  beforeEach() {
    const MockCurrentUserService = Service.extend({
      model: resolve(EmberObject.create({
        id: 1
      }))
    });
    this.register('service:current-user', MockCurrentUserService);
    this.inject.service('current-user', { as: 'currentUser' });

    const MockCommonAjaxService = Service.extend({
      request() {
        return resolve({ userEvents: [] });
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
  assert.expect(10);
  let event1 = {
    offering: 1,
    startDate: '2011-04-21'
  };
  let event2 = {
    ilmSession: 3,
    startDate: '2008-09-02'
  };
  let event3 = {
    startDate: '2015-11-20'
  };
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/userevents/1?from=1425542400000&to=1425628800000');
      return resolve({ userEvents: [ event1, event2, event3 ] });
    }
  });
  let from = moment('20150305', 'YYYYMMDD').hour(0);
  let to = from.clone().hour(24);
  const subject = this.subject();
  run(async () => {
    const events = await subject.getEvents(from, to);
    assert.equal(events.length, 3);
    assert.equal(events[0], event2);
    assert.equal(events[0].isBlanked, false);
    assert.equal(events[0].slug, 'U20080902I3');
    assert.equal(events[1], event1);
    assert.equal(events[1].isBlanked, false);
    assert.equal(events[1].slug, 'U20110421O1');
    assert.equal(events[2], event3);
    assert.equal(events[2].isBlanked, true);
  });
});

test('getEvents - no user', async function(assert){
  assert.expect(1);
  this.currentUser.reopen({
    model: resolve(null)
  });
  this.commonAjax.reopen({
    request() {
      assert.ok(false, 'this assertion should never be called.');
    }
  });
  const subject = this.subject();
  let from = moment('20150305', 'YYYYMMDD').hour(0);
  let to = from.clone().hour(24);
  run( async () => {
    let events = await subject.getEvents(from, to);
    assert.equal(events.length, 0);
  });
});

test('getEvents - with configured namespace', async function(assert){
  assert.expect(2);
  this.iliosConfig.reopen({
    apiNameSpace: 'geflarknik'
  });
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/geflarknik/userevents/1?from=1425542400000&to=1425628800000');
      return resolve({ userEvents: [] });
    }
  });
  const subject = this.subject();
  let from = moment('20150305', 'YYYYMMDD').hour(0);
  let to = from.clone().hour(24);
  run( async () => {
    let events = await subject.getEvents(from, to);
    assert.equal(events.length, 0);
  });
});

test('getEventsForSlug - offering', async function(assert){
  assert.expect(2);
  let event1 = {
    offering: 1,
    startDate: '2011-04-21'
  };
  let event2 = {
    ilmSession: 3,
    startDate: '2008-09-02'
  };
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/userevents/1?from=1358755200&to=1358841600');
      return resolve({ userEvents: [event1, event2] });
    }
  });
  const subject = this.subject();
  run( async () => {
    let event = await subject.getEventForSlug('U20130121O1');
    assert.equal(event, event1);
  });
});

test('getEventsForSlug - ILM', async function(assert){
  assert.expect(2);
  let event1 = {
    offering: 1,
    startDate: '2011-04-21'
  };
  let event2 = {
    ilmSession: 3,
    startDate: '2008-09-02'
  };
  this.commonAjax.reopen({
    request(url) {
      assert.equal(url, '/userevents/1?from=1358755200&to=1358841600');
      return resolve({ userEvents: [event1, event2] });
    }
  });
  const subject = this.subject();
  run( async () => {
    let event = await subject.getEventForSlug('U20130121I3');
    assert.equal(event, event2);
  });
});

test('getSlugForEvent - offering', function(assert) {
  assert.expect(1);
  const service = this.subject();
  const event = {
    startDate: moment('2013-01-21').toDate(),
    offering: 1
  };
  assert.equal(service.getSlugForEvent(event), 'U20130121O1');
});

test('getSlugForEvent - ILM', function(assert) {
  assert.expect(1);
  const service = this.subject();
  const event = {
    startDate: moment('2014-10-30').toDate(),
    ilmSession: 1
  };
  assert.equal(service.getSlugForEvent(event), 'U20141030I1');
});
