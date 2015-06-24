import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: Course - Publish', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('cohort', {
      courses: [1, 2, 3],
    });
    server.create('publishEvent', {
      administrator: 4136,
      courses: [1],
    });
    server.create('publishEvent', {
      administrator: 4136,
      courses: [2],
    });
    fixtures.publishedCourse = server.create('course', {
      year: 2013,
      owningSchool: 1,
      publishEvent: 1,
      cohorts: [1],
    });
    fixtures.scheduledCourse = server.create('course', {
      year: 2013,
      owningSchool: 1,
      publishEvent: 2,
      publishedAsTbd: true,
      cohorts: [1],
    });
    fixtures.draftCourse = server.create('course', {
      year: 2013,
      owningSchool: 1,
      cohorts: [1],
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check published course', function(assert) {
  visit('/courses/' + fixtures.publishedCourse.id);

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
  visit('/courses/' + fixtures.scheduledCourse.id);

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
  visit('/courses/' + fixtures.draftCourse.id);

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
  visit('/courses/' + fixtures.draftCourse.id);


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
  visit('/courses/' + fixtures.draftCourse.id);
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
  visit('/courses/' + fixtures.scheduledCourse.id);
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
  visit('/courses/' + fixtures.scheduledCourse.id);
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
  visit('/courses/' + fixtures.publishedCourse.id);
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
  visit('/courses/' + fixtures.publishedCourse.id);
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
