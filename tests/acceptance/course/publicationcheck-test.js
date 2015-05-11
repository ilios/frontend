/* global moment */
import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
module('Acceptance: Course - Publication Check', {
  beforeEach: function() {
    application = startApp();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('cohort', {
      courses: [1],
    });
    server.create('objective', {
      courses: [1],
    });
    server.create('discipline', {
      courses: [1],
    });
    server.create('meshDescriptor', {
      courses: [1],
    });
    fixtures.fullCourse = server.create('course', {
      year: 2013,
      owningSchool: 1,
      cohorts: [1],
      objectives: [1],
      disciplines: [1],
      meshDescriptors: [1],
    });
    fixtures.emptyCourse = server.create('course', {
      year: 2013,
      owningSchool: 1
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('full course count', function(assert) {
  visit('/course/' + fixtures.fullCourse.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.publicationcheck');
    var items = find('.course-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('course 0'));
    assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
  });
});

test('empty course count', function(assert) {
  visit('/course/' + fixtures.emptyCourse.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.publicationcheck');
    var items = find('.course-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('course 1'));
    assert.equal(getElementText(items.eq(1)), getText('No'));
    assert.equal(getElementText(items.eq(2)), getText('No'));
    assert.equal(getElementText(items.eq(3)), getText('No'));
    assert.equal(getElementText(items.eq(4)), getText('No'));
  });
});
