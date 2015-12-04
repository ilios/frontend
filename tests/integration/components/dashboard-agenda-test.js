import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

let today = moment();
let mockEvents = [
  {name: 'first', startDate: today.format(), location: 123},
  {name: 'second', startDate: today.format(), location: 456},
  {name: 'third', startDate: today.format(), location: 789},
];
let userEventsMock = Ember.Service.extend({
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
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders with events', function(assert) {
  this.container.register('service:mockuserevents', userEventsMock);
  this.container.injection('component', 'userEvents', 'service:mockuserevents');
  assert.expect(6);
  
  this.render(hbs`{{dashboard-agenda}}`);

  for(let i = 0; i < 3; i++){
    let tds = this.$(`table tr:eq(${i}) td`);
    assert.equal(tds.eq(0).text().trim(), moment(mockEvents[i].startDate).format('dddd, MMMM Do, YYYY h:mma'));
    assert.equal(tds.eq(1).text().trim(), mockEvents[i].name);
  }
});

test('it renders blank', function(assert) {
  this.container.register('service:mockuserevents', blankEventsMock);
  this.container.injection('component', 'userEvents', 'service:mockuserevents');
  assert.expect(1);
  
  this.render(hbs`{{dashboard-agenda}}`);

  assert.equal(this.$().text().trim(), 'No upcoming events');
});
