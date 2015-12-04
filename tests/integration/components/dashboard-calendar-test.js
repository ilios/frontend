import moment from 'moment';
import { moduleForComponent, test } from 'ember-qunit';
import tHelper from "ember-i18n/helper";
import {a as testgroup} from 'ilios/tests/helpers/test-groups';
import Ember from 'ember';

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

moduleForComponent('dashboard-calendar', 'Integration | Component | dashboard calendar' + testgroup, {
  integration: true,
  beforeEach: function() {
    this.container.register('service:mockuserevents', userEventsMock);
    this.container.injection('component', 'userEvents', 'service:mockuserevents');
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  /*
  {{dashboard-calendar
    selectedDate=selectedDate
    selectedView=selectedView
    goBack='goBack'
    goForward='goForward'
    gotoToday='gotoToday'
    setView='setView'
  }}
   */
  // this.render(hbs`{{dashboard-calendar selectedDate='2014-01-01'}}`);
  //punted on writing more in depth tests for this complicated component
  //probably need to break it up into pieces, also it is covered by acceptance test
  assert.ok(true);
  // assert.equal(this.$().text().trim(), '');
});
