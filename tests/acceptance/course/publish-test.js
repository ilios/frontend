import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {d as testgroup} from 'ilios/tests/helpers/test-groups';

var application;

module('Acceptance: Course - Publish' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('cohort', {
      courses: [1],
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check published course', function(assert) {
  server.create('publishEvent', {
    administrator: 4136,
    courses: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    publishEvent: 1,
    cohorts: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    publishEvent: 2,
    publishedAsTbd: true,
    cohorts: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    let menu = find('.course-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Published'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Review 3 Missing Items', 'Mark as Scheduled', 'UnPublish Course'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check scheduled course', function(assert) {
  server.create('publishEvent', {
    administrator: 4136,
    courses: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    publishEvent: 1,
    publishedAsTbd: true,
    cohorts: [1],
  });
  visit('/courses/1');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    let menu = find('.course-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Scheduled'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'UnPublish Course'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check draft course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');

  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    let menu = find('.course-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Not Published'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'Mark as Scheduled'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check publish draft course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');


  andThen(function() {
    let menu = find('.course-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(0)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Published'));
    });
  });
});

test('check schedule draft course', function(assert) {
  server.create('course', {
    year: 2013,
    school: 1,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    let menu = find('.course-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Scheduled'));
    });
  });
});

test('check publish scheduled course', function(assert) {
  server.create('publishEvent', {
    administrator: 4136,
    courses: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    publishEvent: 1,
    publishedAsTbd: true,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    let menu = find('.course-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(0)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Published'));
    });
  });
});

test('check unpublish scheduled course', function(assert) {
  server.create('publishEvent', {
    administrator: 4136,
    courses: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    publishEvent: 1,
    publishedAsTbd: true,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    let menu = find('.course-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Not Published'));
    });
  });
});

test('check schedule published course', function(assert) {
  server.create('publishEvent', {
    administrator: 4136,
    courses: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    publishEvent: 1,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    let menu = find('.course-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(1)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Scheduled'));
    });
  });
});

test('check unpublish published course', function(assert) {
  server.create('publishEvent', {
    administrator: 4136,
    courses: [1],
  });
  server.create('course', {
    year: 2013,
    school: 1,
    publishEvent: 1,
    cohorts: [1],
  });
  visit('/courses/1');
  andThen(function() {
    let menu = find('.course-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Not Published'));
    });
  });
});
