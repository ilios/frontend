import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import moment from 'moment';

const { resolve } = RSVP;

module('Integration | Service | user events', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    const MockCurrentUserService = Service.extend({
      model: resolve(EmberObject.create({
        id: 1
      }))
    });
    this.owner.register('service:current-user', MockCurrentUserService);
    this.currentUser = this.owner.lookup('service:current-user');

    const MockCommonAjaxService = Service.extend({
      request() {
        return resolve({ userEvents: [] });
      }
    });
    this.owner.register('service:commonAjax', MockCommonAjaxService);
    this.commonAjax = this.owner.lookup('service:commonAjax');

    const MockIliosConfigService = Service.extend({
      apiNameSpace: ''
    });
    this.owner.register('service:iliosConfig', MockIliosConfigService);
    this.iliosConfig = this.owner.lookup('service:iliosConfig');
  });

  test('getEvents', async function(assert){
    assert.expect(10);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21'
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02'
    };
    const event3 = {
      startDate: '2015-11-20'
    };
    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    this.commonAjax.reopen({
      request(url) {
        assert.equal(url, `/userevents/1?from=${from.unix()}&to=${to.unix()}`);
        return resolve({ userEvents: [ event1, event2, event3 ] });
      }
    });

    const subject = this.owner.lookup('service:user-events');
    run(async () => {
      const events = await subject.getEvents(from.unix(), to.unix());
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
    const subject = this.owner.lookup('service:user-events');
    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    run( async () => {
      const events = await subject.getEvents(from.unix(), to.unix());
      assert.equal(events.length, 0);
    });
  });

  test('getEvents - with configured namespace', async function(assert){
    assert.expect(2);
    this.iliosConfig.reopen({
      apiNameSpace: 'geflarknik'
    });
    const from = moment('20150305', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    this.commonAjax.reopen({
      request(url) {
        assert.equal(url, `/geflarknik/userevents/1?from=${from.unix()}&to=${to.unix()}`);
        return resolve({ userEvents: [] });
      }
    });
    const subject = this.owner.lookup('service:user-events');

    run( async () => {
      const events = await subject.getEvents(from.unix(), to.unix());
      assert.equal(events.length, 0);
    });
  });

  test('getEvents - sorted by name for events occupying same time slot', async function(assert){
    assert.expect(3);
    const event1 = {
      name: 'Zeppelin',
      offering: 1,
      startDate: '2011-04-21'
    };
    const event2 = {
      name: 'Aardvark',
      offering: 2,
      startDate: '2011-04-21'
    };

    const from = moment('20110421', 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    this.commonAjax.reopen({
      request() {
        return resolve({ userEvents: [ event1, event2 ] });
      }
    });

    const subject = this.owner.lookup('service:user-events');
    run(async () => {
      const events = await subject.getEvents(from.unix(), to.unix());
      assert.equal(events.length, 2);
      assert.equal(events[0], event2);
      assert.equal(events[1], event1);
    });
  });


  test('getEventsForSlug - offering', async function(assert){
    assert.expect(2);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21'
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02'
    };
    this.commonAjax.reopen({
      request(url) {
        const from = moment('20130121', 'YYYYMMDD').hour(0);
        const to = from.clone().hour(24);
        assert.equal(url, `/userevents/1?from=${from.unix()}&to=${to.unix()}`);
        return resolve({ userEvents: [event1, event2] });
      }
    });
    const subject = this.owner.lookup('service:user-events');
    run( async () => {
      const event = await subject.getEventForSlug('U20130121O1');
      assert.equal(event, event1);
    });
  });

  test('getEventsForSlug - ILM', async function(assert){
    assert.expect(2);
    const event1 = {
      offering: 1,
      startDate: '2011-04-21'
    };
    const event2 = {
      ilmSession: 3,
      startDate: '2008-09-02'
    };
    this.commonAjax.reopen({
      request(url) {
        const from = moment('20130121', 'YYYYMMDD').hour(0);
        const to = from.clone().hour(24);
        assert.equal(url, `/userevents/1?from=${from.unix()}&to=${to.unix()}`);
        return resolve({ userEvents: [event1, event2] });
      }
    });
    const subject = this.owner.lookup('service:user-events');
    run( async () => {
      const event = await subject.getEventForSlug('U20130121I3');
      assert.equal(event, event2);
    });
  });

  test('getSlugForEvent - offering', function(assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:user-events');
    const event = {
      startDate: moment('2013-01-21').toDate(),
      offering: 1
    };
    assert.equal(service.getSlugForEvent(event), 'U20130121O1');
  });

  test('getSlugForEvent - ILM', function(assert) {
    assert.expect(1);
    const service = this.owner.lookup('service:user-events');
    const event = {
      startDate: moment('2014-10-30').toDate(),
      ilmSession: 1
    };
    assert.equal(service.getSlugForEvent(event), 'U20141030I1');
  });
});
