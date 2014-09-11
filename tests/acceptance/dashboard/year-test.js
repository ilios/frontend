/* global moment */
import Ember from 'ember';
import startApp from '../../helpers/start-app';

var App;

module('Acceptance: DashboardYear', {
    setup: function() {
        App = startApp();
    },
    teardown: function() {
        Ember.run(App, App.destroy);
    }
});

test('dashboard default year renders', function(){
    expect(2);
    visit('/dashboard/year');

    andThen(function(){
        var welcome = find('p:first');
        var events = find('div.container ol li');
        equal(welcome.text().trim(), 'Hello Test User,');
        equal(events.length, 3);
    });
});

test('dashboard last year renders', function(){
    expect(2);

    visit('/dashboard/year?year=' + moment().subtract(1, 'year').format('YYYY'));

    andThen(function(){
        var welcome = find('p:first');
        var events = find('div.container ol li');
        equal(welcome.text().trim(), 'Hello Test User,');
        equal(events.length, 1);
    });
});

test('dashboard this year renders', function(){
    expect(2);

    visit('/dashboard/year?year=' + moment().format('YYYY'));

    andThen(function(){
        var welcome = find('p:first');
        var events = find('div.container ol li');
        equal(welcome.text().trim(), 'Hello Test User,');
        equal(events.length, 3);
    });
});
