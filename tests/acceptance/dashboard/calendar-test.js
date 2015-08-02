/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;

module('Acceptance: Dashboard Calendar', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('load month calendar', function(assert) {
  let today = moment().hour(8);
  let startOfMonth = today.clone().startOf('month');
  let endOfMonth = today.clone().endOf('month').hour(22).minute(59);
  server.create('userevent', {
    name: 'start of month',
    startDate: startOfMonth.format(),
    endDate: startOfMonth.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    name: 'end of month',
    startDate: endOfMonth.format(),
    endDate: endOfMonth.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=month');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfMonth.format('h:mma') + '-' + startOfMonth.clone().add(1, 'hour').format('h:mma') + ': start of month';
    eventInfo += endOfMonth.format('h:mma') + '-' + endOfMonth.clone().add(1, 'hour').format('h:mma') + ': end of month';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('load week calendar', function(assert) {
  let today = moment().hour(8);
  let startOfWeek = today.clone().startOf('week');
  let endOfWeek = today.clone().endOf('week').hour(22).minute(59);
  server.create('userevent', {
    name: 'start of week',
    startDate: startOfWeek.format(),
    endDate: startOfWeek.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    name: 'end of week',
    startDate: endOfWeek.format(),
    endDate: endOfWeek.clone().add(1, 'hour').format()
  });
  visit('/');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 2);
    let eventInfo = '';
    eventInfo += startOfWeek.format('h:mma') + '-' + startOfWeek.clone().add(1, 'hour').format('h:mma') + ': start of week';
    eventInfo += endOfWeek.format('h:mma') + '-' + endOfWeek.clone().add(1, 'hour').format('h:mma') + ': end of week';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('load day calendar', function(assert) {
  let today = moment().hour(8);
  let tomorow = today.clone().add(1, 'day');
  let yesterday = today.clone().subtract(1, 'day');
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    name: 'tomorow',
    startDate: tomorow.format(),
    endDate: tomorow.clone().add(1, 'hour').format()
  });
  server.create('userevent', {
    name: 'yesterday',
    startDate: yesterday.format(),
    endDate: yesterday.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=day');
  andThen(function() {
    assert.equal(currentPath(), 'dashboard');
    let events = find('div.event');
    assert.equal(events.length, 1);
    let eventInfo = '';
    eventInfo += today.format('h:mma') + '-' + today.clone().add(1, 'hour').format('h:mma') + ': today';
    assert.equal(getElementText(events), getText(eventInfo));

  });
});

test('click month day number and go to day', function(assert) {
  let aDayInTheMonth = moment().startOf('month').add(12, 'days').hour(8);
  server.create('userevent', {
    name: 'start of month',
    startDate: aDayInTheMonth.format(),
    endDate: aDayInTheMonth.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=month');
  andThen(function() {
    let dayOfMonth = aDayInTheMonth.date();
    let link = find('.day a').filter(function(){
      return parseInt($(this).text()) === dayOfMonth;
    }).eq(0);
    click(link).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + aDayInTheMonth.format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click week day title and go to day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=week');
  andThen(function() {
    let dayOfWeek = today.day();
    click(find('.week-titles a').eq(dayOfWeek)).then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click forward on a day goes to next day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'day').format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click forward on a week goes to next week', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'week').format('YYYY-MM-DD'));
    });
  });
});

test('click forward on a month goes to next month', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(2)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.add(1, 'month').format('YYYY-MM-DD') + '&view=month');
    });
  });
});

test('click back on a day goes to previous day', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=day');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'day').format('YYYY-MM-DD') + '&view=day');
    });
  });
});

test('click back on a week goes to previous week', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=week');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'week').format('YYYY-MM-DD'));
    });
  });
});

test('click back on a month goes to previous month', function(assert) {
  let today = moment().hour(8);
  server.create('userevent', {
    name: 'today',
    startDate: today.format(),
    endDate: today.clone().add(1, 'hour').format()
  });
  visit('/dashboard?view=month');
  andThen(function() {
    click('.calendar-time-picker li:eq(0)').then(()=>{
      assert.equal(currentURL(), '/dashboard?date=' + today.subtract(1, 'month').format('YYYY-MM-DD') + '&view=month');
    });
  });
});
