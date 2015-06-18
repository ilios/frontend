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
    fixtures.today = moment().hour(8);
    fixtures.startOfMonth = fixtures.today.clone().startOf('month');
    fixtures.endOfMonth = fixtures.today.clone().endOf('month').hour(22).minute(59);
    fixtures.startOfWeek = fixtures.today.clone().startOf('week');
    fixtures.endOfWeek = fixtures.today.clone().endOf('week').hour(22).minute(59);
    server.create('userevent', {
      name: 'start of month',
      startDate: fixtures.startOfMonth.format(),
      endDate: fixtures.startOfMonth.clone().add(1, 'hour').format()
    });
    server.create('userevent', {
      name: 'start of week',
      startDate: fixtures.startOfWeek.format(),
      endDate: fixtures.startOfWeek.clone().add(1, 'hour').format()
    });
    server.create('userevent', {
      name: 'today',
      startDate: fixtures.today.format(),
      endDate: fixtures.today.clone().add(1, 'hour').format()
    });
    server.create('userevent', {
      name: 'end of week',
      startDate: fixtures.endOfWeek.format(),
      endDate: fixtures.endOfWeek.clone().add(1, 'hour').format()
    });
    server.create('userevent', {
      name: 'end of month',
      startDate: fixtures.endOfMonth.format(),
      endDate: fixtures.endOfMonth.clone().add(1, 'hour').format()
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('load month calendar', function(assert) {
  visit('/dashboard?view=month');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard.index');
    let events = find('div.event');
    assert.equal(events.length, 5);
    let eventInfo = '';
    eventInfo += fixtures.startOfMonth.format('h:mma') + '-' + fixtures.startOfMonth.clone().add(1, 'hour').format('h:mma') + ': start of month';
    eventInfo += fixtures.startOfWeek.format('h:mma') + '-' + fixtures.startOfWeek.clone().add(1, 'hour').format('h:mma') + ': start of week';
    eventInfo += fixtures.today.format('h:mma') + '-' + fixtures.today.clone().add(1, 'hour').format('h:mma') + ': today';
    eventInfo += fixtures.endOfWeek.format('h:mma') + '-' + fixtures.endOfWeek.clone().add(1, 'hour').format('h:mma') + ': end of week';
    eventInfo += fixtures.endOfMonth.format('h:mma') + '-' + fixtures.endOfMonth.clone().add(1, 'hour').format('h:mma') + ': end of month';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('load week calendar', function(assert) {
  visit('/');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard.index');
    let events = find('div.event');
    assert.equal(events.length, 3);
    let eventInfo = '';
    eventInfo += fixtures.startOfWeek.format('h:mma') + '-' + fixtures.startOfWeek.clone().add(1, 'hour').format('h:mma') + ': start of week';
    eventInfo += fixtures.today.format('h:mma') + '-' + fixtures.today.clone().add(1, 'hour').format('h:mma') + ': today';
    eventInfo += fixtures.endOfWeek.format('h:mma') + '-' + fixtures.endOfWeek.clone().add(1, 'hour').format('h:mma') + ': end of week';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('load day calendar', function(assert) {
  visit('/dashboard?view=day');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard.index');
    let events = find('div.event');
    assert.equal(events.length, 1);
    let eventInfo = '';
    eventInfo += fixtures.today.format('h:mma') + '-' + fixtures.today.clone().add(1, 'hour').format('h:mma') + ': today';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('click month day number and go to day', function(assert) {
  visit('/dashboard?view=month');
  andThen(function() {
    let dayOfMonth = fixtures.today.date();
    click(find('.day a').eq(dayOfMonth)).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click week day title and go to day', function(assert) {
  visit('/dashboard?view=week');
  andThen(function() {
    let dayOfWeek = fixtures.today.day();
    click(find('.week-titles a').eq(dayOfWeek)).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click forward on a day goes to next day', function(assert) {
  visit('/dashboard?view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.add(1, 'day').format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click forward on a week goes to next week', function(assert) {
  visit('/dashboard?view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.add(1, 'week').format('YYYY-MM-DD'));
    });
  });
});

test('click forward on a month goes to next month', function(assert) {
  visit('/dashboard?view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.add(1, 'month').format('YYYY-MM-DD') + '&view=month');
    });
  });
});

test('click back on a day goes to previous day', function(assert) {
  visit('/dashboard?view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.subtract(1, 'day').format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click back on a week goes to previous week', function(assert) {
  visit('/dashboard?view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.subtract(1, 'week').format('YYYY-MM-DD'));
    });
  });
});

test('click back on a month goes to previous month', function(assert) {
  visit('/dashboard?view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + fixtures.today.subtract(1, 'month').format('YYYY-MM-DD') + '&view=month');
    });
  });
});
