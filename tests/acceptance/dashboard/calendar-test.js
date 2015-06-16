/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: Dashboard Calendar', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    let today = moment().hour(8);
    fixtures.today = today;
    server.create('userevent', {
      name: 'session 0',
      startDate: today.format(),
      endDate: today.clone().add(1, 'hour').format()
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('load calendar', function(assert) {
  visit('/');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard.index');
    let events = find('div.event');
    assert.equal(events.length, 1);
    assert.equal(getElementText(events), getText(fixtures.today.format('h:mma') + '-' + fixtures.today.clone().add(1, 'hour').format('h:mma') + ': session 0'));
  });
});
