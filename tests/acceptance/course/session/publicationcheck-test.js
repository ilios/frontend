/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
module('Acceptance: Session - Publication Check', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('course', {
      sessions: [1,2]
    });
    server.create('sessionType');
    server.create('school');
    server.create('offering', {
      sessions: [1],
    });
    server.create('objective', {
      sessions: [1],
    });
    server.create('discipline', {
      sessions: [1],
    });
    server.create('meshDescriptor', {
      sessions: [1],
    });
    fixtures.fullSession = server.create('session', {
      course: 1,
      offerings: [1],
      objectives: [1],
      disciplines: [1],
      meshDescriptors: [1],
    });
    fixtures.emptySession = server.create('session', {
      course: 1
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('full session count', function(assert) {
  visit('/course/1/session/' + fixtures.fullSession.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.sessionpublicationcheck');
    var items = find('.session-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('session 0'));
    assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
  });
});

test('empty course count', function(assert) {
  visit('/course/1/session/' + fixtures.emptySession.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.sessionpublicationcheck');
    var items = find('.session-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('session 1'));
    assert.equal(getElementText(items.eq(1)), getText('No'));
    assert.equal(getElementText(items.eq(2)), getText('No'));
    assert.equal(getElementText(items.eq(3)), getText('No'));
    assert.equal(getElementText(items.eq(4)), getText('No'));
  });
});
