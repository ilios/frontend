import destroyApp from '../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';

var application;
var fixtures = {};
module('Acceptance: Course - Publication Check' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {id: 4136});
    server.create('school');
    server.create('cohort', {
      courses: [1],
    });
    server.create('objective', {
      courses: [1],
    });
    server.create('topic', {
      courses: [1],
    });
    server.create('meshDescriptor', {
      courses: [1],
    });
    fixtures.fullCourse = server.create('course', {
      year: 2013,
      school: 1,
      cohorts: [1],
      objectives: [1],
      topics: [1],
      meshDescriptors: [1],
    });
    fixtures.emptyCourse = server.create('course', {
      year: 2013,
      school: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('full course count', function(assert) {
  visit('/courses/' + fixtures.fullCourse.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.publicationCheck');
    var items = find('.course-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('course 0'));
    assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
    assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
  });
});

test('empty course count', function(assert) {
  visit('/courses/' + fixtures.emptyCourse.id + '/publicationcheck');
  andThen(function() {
    assert.equal(currentPath(), 'course.publicationCheck');
    var items = find('.course-publication-check .detail-content table tbody td');
    assert.equal(getElementText(items.eq(0)), getText('course 1'));
    assert.equal(getElementText(items.eq(1)), getText('No'));
    assert.equal(getElementText(items.eq(2)), getText('No'));
    assert.equal(getElementText(items.eq(3)), getText('No'));
    assert.equal(getElementText(items.eq(4)), getText('No'));
  });
});
