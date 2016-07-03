import destroyApp from '../../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: Session - Publish', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('course');
    server.create('offering', {
      startDate: moment().format(),
      endDate: moment().add('6 hours').format()
    });
    server.create('sessionType');
    server.create('ilmSession', {
      session: 4,
      dueDate: moment().format()
    });
    fixtures.publishedSession = server.create('session', {
      published: true,
      course: 1,
      offerings: [1]
    });
    fixtures.scheduledSession = server.create('session', {
      course: 1,
      published: true,
      publishedAsTbd: true,
      offerings: [1],
    });
    fixtures.draftSession = server.create('session', {
      course: 1,
      offerings: [1],
    });
    fixtures.ilmSession = server.create('session', {
      course: 1,
      ilmSession: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check published session', function(assert) {
  visit('/courses/1/sessions/' + fixtures.publishedSession.id);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
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
  visit('/courses/1/sessions/' + fixtures.scheduledSession.id);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
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
  visit('/courses/1/sessions/' + fixtures.draftSession.id);

  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
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
  visit('/courses/1/sessions/' + fixtures.draftSession.id);


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
  visit('/courses/1/sessions/' + fixtures.draftSession.id);
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
  visit('/courses/1/sessions/' + fixtures.scheduledSession.id);
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
  visit('/courses/1/sessions/' + fixtures.scheduledSession.id);
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
  visit('/courses/1/sessions/' + fixtures.publishedSession.id);
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
  visit('/courses/1/sessions/' + fixtures.publishedSession.id);
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

test('check publish requirements for ilm session', function(assert) {
  visit('/courses/1/sessions/' + fixtures.ilmSession.id);
  andThen(function() {
    let menu = find('.session-publication-menu').eq(0);
    click('.button', menu).then(function(){
      assert.equal(getElementText(find('li:eq(0)', menu)), getText('Publish As-is'));
      assert.equal(getElementText(find('li:eq(1)', menu)), getText('Review 3 Missing Items'));
    });
  });
});
