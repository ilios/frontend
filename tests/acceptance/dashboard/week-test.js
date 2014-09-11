import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: DashboardWeek', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test("This week renders", function() {
    expect(2);
    visit('/dashboard/week').then(function() {
        equal(find('p:first').text().trim(), 'Hello Test User,', "Page contains user name");
        equal(find('div.container ol li').length, 2, "Events List contains expected number of models");
    });
});
