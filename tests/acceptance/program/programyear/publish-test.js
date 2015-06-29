import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};

module('Acceptance: Program Year - Publish', {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('publishEvent', {
      administrator: 4136,
      programs: [1],
    });
    server.create('program', {
      programYears: [1,2,3]
    });
    fixtures.published = server.create('programYear', {
      program: 1,
      publishEvent: 1,
    });
    fixtures.scheduled = server.create('programYear', {
      program: 1,
      publishEvent: 1,
      publishedAsTbd: true
    });
    fixtures.draft = server.create('programYear', {
      program: 1,
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('check published program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.published.id);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    let menu = find('.programyear-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Published'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Review 4 Missing Items', 'Mark as Scheduled', 'UnPublish Program Year'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check scheduled program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.scheduled.id);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    let menu = find('.programyear-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Scheduled'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'UnPublish Program Year'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check draft program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.draft.id);

  andThen(function() {
    assert.equal(currentPath(), 'program.programYear.index');
    let menu = find('.programyear-publication-menu').eq(0);
    let button = find('.button' ,menu);
    assert.equal(getElementText(button), getText('Not Published'));
    //we have to click the button to create the options
    click('.button', menu).then(function(){
      let items = find('.dropdown-menu li', menu);
      assert.equal(items.length, 3);
      let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'Mark as Scheduled'];
      for(let i = 0; i < items.length; i++){
        assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
      }
    });
  });
});

test('check publish draft program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.draft.id);


  andThen(function() {
    let menu = find('.programyear-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(0)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Published'));
    });
  });
});

test('check schedule draft program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.draft.id);
  andThen(function() {
    let menu = find('.programyear-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Scheduled'));
    });
  });
});

test('check publish scheduled program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.scheduled.id);
  andThen(function() {
    let menu = find('.programyear-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(0)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Published'));
    });
  });
});

test('check unpublish scheduled program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.scheduled.id);
  andThen(function() {
    let menu = find('.programyear-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Not Published'));
    });
  });
});

test('check schedule published program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.published.id);
  andThen(function() {
    let menu = find('.programyear-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(1)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Scheduled'));
      //we have to click the button to create the options
      click('.button', menu).then(function(){
        let items = find('.dropdown-menu li', menu);
        assert.equal(items.length, 3);
        let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'UnPublish Program Year'];
        for(let i = 0; i < items.length; i++){
          assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
        }
      });
    });
  });
});

test('check unpublish published program year', function(assert) {
  visit('/programs/1/programyears/' + fixtures.published.id);
  andThen(function() {
    let menu = find('.programyear-publication-menu').eq(0);
    click('.button', menu).then(function(){
      return click('li:eq(2)', menu);
    });

    andThen(function(){
      assert.equal(getElementText(find('.button', menu)), getText('Not Published'));
    });
  });
});
