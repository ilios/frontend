import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1';
module('Acceptance: Course - Session List', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    fixtures.sessionTypes = server.createList('sessionType', 1, {
      sessions: [1,2,3,4]
    });
    server.create('course', {
      sessions: [1,2,3,4]
    });
    fixtures.sessions = [];
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
    }));
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
    }));
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
    }));
    fixtures.sessions.pushObject(server.create('session', {
      course: 1,
      sessionType: 1,
    }));
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('session list', function(assert) {
  visit(url);

  andThen(function() {
    var container = find('.sessions-list');
    var rows = find('tbody tr', container);
    assert.equal(rows.length, fixtures.sessions.length);
    for(let i = 0; i < fixtures.sessions.length; i++){
      assert.equal(getElementText(find('td:eq(0)', rows.eq(i))), getText(fixtures.sessions[i].title));
      assert.equal(getElementText(find('td:eq(1)', rows.eq(i))), getText(fixtures.sessionTypes[fixtures.sessions[i].sessionType - 1].title));
    }
  });
});

test('new session', function(assert) {
  visit(url);
  var newTitle = 'new session title, woohoo';
  andThen(function() {
    var container = find('.sessions-list');
    click('.sessions-list .detail-actions .add');
    andThen(function(){
      fillIn('.sessions-list .newsession input:eq(0)', newTitle);
      click('.sessions-list .newsession .done');
    });
  });
  andThen(function(){
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.session-overview');
    assert.equal(getElementText(find('.title .content', container)), getText(newTitle));
  });
});
