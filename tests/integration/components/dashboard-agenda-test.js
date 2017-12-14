import { resolve } from 'rsvp';
import Service from '@ember/service';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';


let mockEvents;
let userEventsMock;
let blankEventsMock;

moduleForComponent('dashboard-agenda', 'Integration | Component | dashboard agenda', {
  integration: true,
  beforeEach(){
    let today = moment();
    mockEvents = [
      {name: 'first', startDate: today.format(), location: 123, lastModified: today.format(), attendanceRequired: true, equipmentRequired: true, attireRequired: true},
      {name: 'second', startDate: today.format(), location: 456, lastModified: today.format(), attendanceRequired: false, equipmentRequired: false, attireRequired: false},
      {name: 'third', startDate: today.format(), location: 789, lastModified: today.format(), attendanceRequired: false, equipmentRequired: false, attireRequired: false},
    ];
    userEventsMock = Service.extend({
      getEvents(){
        return new resolve(mockEvents);
      }
    });
    blankEventsMock = Service.extend({
      getEvents(){
        return new resolve([]);
      }
    });
  }
});

test('it renders with events', function(assert) {
  assert.expect(7);
  this.register('service:user-events', userEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.render(hbs`{{dashboard-agenda}}`);
  const title = 'h3';

  return wait().then(()=>{
    assert.equal(this.$(title).text().trim(), 'My Activities for the next 60 days');
    for(let i = 0; i < 3; i++){
      let tds = this.$(`table tr:eq(${i}) td`);
      assert.equal(tds.eq(0).text().trim(), moment(mockEvents[i].startDate).format('dddd, MMMM Do, YYYY h:mma'));
      assert.equal(tds.eq(1).text().trim(), mockEvents[i].name);
    }
  });
});

test('session attribute icons', function(assert) {
  assert.expect(6);
  this.register('service:user-events', userEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.render(hbs`{{dashboard-agenda}}`);
  return wait().then(()=>{
    assert.equal(this.$('table tr:eq(0) td:eq(3) .fa-black-tie').length, 1);
    assert.equal(this.$('table tr:eq(0) td:eq(3) .fa-flask').length, 1);
    assert.equal(this.$('table tr:eq(0) td:eq(3) .fa-calendar-check-o').length, 1);
    assert.equal(this.$('table tr:eq(1) td:eq(3) .fa-black-tie').length, 0);
    assert.equal(this.$('table tr:eq(1) td:eq(3) .fa-flask').length, 0);
    assert.equal(this.$('table tr:eq(1) td:eq(3) .fa-calendar-check-o').length, 0);
  });
});

test('it renders blank', function(assert) {
  assert.expect(2);
  this.register('service:user-events', blankEventsMock);
  this.inject.service('user-events', { as: 'userEvents' });

  this.render(hbs`{{dashboard-agenda}}`);
  const title = 'h3';
  const body = 'p';

  return wait().then(()=>{
    assert.equal(this.$(title).text().trim(), 'My Activities for the next 60 days');
    assert.equal(this.$(body).text().trim(), 'None');
  });
});
