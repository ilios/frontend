import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: Session - Publish', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('course');
    server.create('offering');
    server.create('sessionType');
    server.create('publishEvent', {
      administrator: 4136,
      sessions: [1, 2],
    });
    fixtures.publishedSession = server.create('session', {
      publishEvent: 1,
      course: 1,
      offerings: [1]
    });
    fixtures.scheduledSession = server.create('session', {
      course: 1,
      publishEvent: 1,
      publishedAsTbd: true,
      offerings: [1],
    });
    fixtures.draftSession = server.create('session', {
      course: 1,
      offerings: [1],
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check published session', function(assert) {
  visit('/course/1/session/' + fixtures.publishedSession.id);

  andThen(function() {
    assert.equal(currentPath(), 'course.session');
    let menu = find('.session-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Published'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Review 3 Missing Items', 'Mark as Scheduled', 'UnPublish Session'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check scheduled session', function(assert) {
  visit('/course/1/session/' + fixtures.scheduledSession.id);

  andThen(function() {
    assert.equal(currentPath(), 'course.session');
    let menu = find('.session-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Scheduled'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'UnPublish Session'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check draft session', function(assert) {
  visit('/course/1/session/' + fixtures.draftSession.id);

  andThen(function() {
    assert.equal(currentPath(), 'course.session');
    let menu = find('.session-publication-menu').eq(0);
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

test('check publish draft session', function(assert) {
  visit('/course/1/session/' + fixtures.draftSession.id);


  andThen(function() {
    let menu = find('.session-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(0)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Published'));
    });
  });
});

test('check schedule draft session', function(assert) {
  visit('/course/1/session/' + fixtures.draftSession.id);
  andThen(function() {
    let menu = find('.session-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Scheduled'));
    });
  });
});

test('check publish scheduled session', function(assert) {
  visit('/course/1/session/' + fixtures.scheduledSession.id);
  andThen(function() {
    let menu = find('.session-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(0)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Published'));
    });
  });
});

test('check unpublish scheduled session', function(assert) {
  visit('/course/1/session/' + fixtures.scheduledSession.id);
  andThen(function() {
    let menu = find('.session-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Not Published'));
    });
  });
});

test('check schedule published session', function(assert) {
  visit('/course/1/session/' + fixtures.publishedSession.id);
  andThen(function() {
    let menu = find('.session-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(1)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Scheduled'));
    });
  });
});

test('check unpublish published session', function(assert) {
  visit('/course/1/session/' + fixtures.publishedSession.id);
  andThen(function() {
    let menu = find('.session-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Not Published'));
    });
  });
});
