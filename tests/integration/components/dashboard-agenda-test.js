import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';
import initializer from "ilios/instance-initializers/ember-i18n";

let today = moment();
const mockEvents = [
  {name: 'first', startDate: today.format(), location: 123},
  {name: 'second', startDate: today.format(), location: 456},
  {name: 'third', startDate: today.format(), location: 789},
];
const userEventsMock = Ember.Service.extend({
  getEvents(){
    return new Ember.RSVP.resolve(mockEvents);
  }
});
let blankEventsMock = Ember.Service.extend({
  getEvents(){
    return new Ember.RSVP.resolve([]);
  }
});

moduleForComponent('dashboard-agenda', 'Integration | Component | dashboard agenda' + testgroup, {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
});

test('it renders with events', function(assert) {
  this.register('service:user-events', userEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });
  assert.expect(6);

  this.render(hbs`{{dashboard-agenda}}`);

  for(let i = 0; i < 3; i++){
    let tds = this.$(`table tr:eq(${i}) td`);
    assert.equal(tds.eq(0).text().trim(), moment(mockEvents[i].startDate).format('dddd, MMMM Do, YYYY h:mma'));
    assert.equal(tds.eq(1).text().trim(), mockEvents[i].name);
  }
});

test('it renders blank', function(assert) {
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });
  assert.expect(1);

  this.render(hbs`{{dashboard-agenda}}`);

  assert.equal(this.$().text().trim(), 'No upcoming events');
});
