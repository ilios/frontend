import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

const { resolve } = RSVP;

let commonAjaxMock;

module('Integration | Component | user profile calendar', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    commonAjaxMock = Service.extend({});
    this.owner.register('service:commonAjax', commonAjaxMock);
    const iliosConfigMock = Service.extend({
      namespace: ''
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
  });

  test('shows events for this week', async function(assert) {
    assert.expect(4);
    commonAjaxMock.reopen({
      request(url){
        const today = moment();
        const from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
        const to = moment(today).day(6).hour(23).minute(59).second(59).format('X');

        assert.equal(url, `/userevents/13?from=${from}&to=${to}`);

        let userEvents = [
          {name: 'first', startDate: today.format(), location: 123, lastModified: today.format()},
          {name: 'second', startDate: today.format(), location: 456, lastModified: today.format()},
          {name: 'third', startDate: today.format(), location: 789, lastModified: today.format()},
        ];

        return resolve({ userEvents });
      }
    });
    const user = EmberObject.create({
      id: 13
    });
    this.set('user', user);
    await render(hbs`{{user-profile-calendar user=user}}`);
    const events = '.ilios-calendar-event';
    const firstEventTitle = `${events}:nth-of-type(1) .ilios-calendar-event-name`;
    const secondEventTitle = `${events}:nth-of-type(2) .ilios-calendar-event-name`;
    const thirdEventTitle = `${events}:nth-of-type(3) .ilios-calendar-event-name`;
    await settled();

    assert.equal(find(firstEventTitle).textContent.trim(), 'first');
    assert.equal(find(secondEventTitle).textContent.trim(), 'second');
    assert.equal(find(thirdEventTitle).textContent.trim(), 'third');
  });

  test('clicking forward goes to next week', async function(assert) {
    assert.expect(2);
    let called = 0;
    commonAjaxMock.reopen({
      request(url){
        switch (called) {
        case 0: {
          const today = moment();
          const from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
          const to = moment(today).day(6).hour(23).minute(59).second(59).format('X');

          assert.equal(url, `/userevents/13?from=${from}&to=${to}`);
        }
          break;
        case 1: {
          const nextWeek = moment().add(1, 'week');
          const from = moment(nextWeek).day(0).hour(0).minute(0).second(0).format('X');
          const to = moment(nextWeek).day(6).hour(23).minute(59).second(59).format('X');

          assert.equal(url, `/userevents/13?from=${from}&to=${to}`);
        }
          break;
        default:
          assert.ok(false, 'Should not be called');
        }
        called++;

        return resolve({ userEvents: [] });
      }
    });
    const user = EmberObject.create({
      id: 13
    });
    this.set('user', user);
    await render(hbs`{{user-profile-calendar user=user}}`);
    const picker = '.calendar-time-picker li';
    const goForward = `${picker}:nth-of-type(3)`;
    find(goForward).click();
    await settled();
  });

  test('clicking backward goes to last week', async function(assert) {
    assert.expect(2);
    let called = 0;
    commonAjaxMock.reopen({
      request(url){
        switch (called) {
        case 0: {
          const today = moment();
          const from = moment(today).day(0).hour(0).minute(0).second(0).format('X');
          const to = moment(today).day(6).hour(23).minute(59).second(59).format('X');

          assert.equal(url, `/userevents/13?from=${from}&to=${to}`);
        }
          break;
        case 1: {
          const lastWeek = moment().subtract(1, 'week');
          const from = moment(lastWeek).day(0).hour(0).minute(0).second(0).format('X');
          const to = moment(lastWeek).day(6).hour(23).minute(59).second(59).format('X');

          assert.equal(url, `/userevents/13?from=${from}&to=${to}`);
        }
          break;
        default:
          assert.ok(false, 'Should not be called');
        }
        called++;

        return resolve({ userEvents: [] });
      }
    });
    const user = EmberObject.create({
      id: 13
    });
    this.set('user', user);
    await render(hbs`{{user-profile-calendar user=user}}`);
    const picker = '.calendar-time-picker li';
    const goBack = `${picker}:nth-of-type(1)`;
    find(goBack).click();
    await settled();
  });
});
