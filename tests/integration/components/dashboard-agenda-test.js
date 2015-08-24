/* global moment */
import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

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

moduleForComponent('dashboard-agenda', 'Integration | Component | dashboard agenda', {
  integration: true,
  beforeEach: function() {
    this.container.register('service:mockuserevents', userEventsMock);
    this.container.injection('component', 'userEvents', 'service:mockuserevents');
  }
});

test('it renders', function(assert) {
  assert.expect(6);
  
  this.render(hbs`{{dashboard-agenda}}`);

  for(let i = 0; i < 3; i++){
    let tds = this.$(`table tr:eq(${i}) td`);
    assert.equal(tds.eq(0).text().trim(), moment(mockEvents[i].startDate).format('dddd, MMMM Do, YYYY h:mma'));
    assert.equal(tds.eq(1).text().trim(), mockEvents[i].name);
  }
});
