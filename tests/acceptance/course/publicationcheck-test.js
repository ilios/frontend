import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
module('Acceptance: Course - Publication Check', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('vocabulary');
    server.create('cohort');
    server.create('objective');
    server.create('term', {
      vocabularyId: 1,
    });
    server.create('meshDescriptor');
    fixtures.fullCourse = server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
      objectiveIds: [1],
      termIds: [1],
      meshDescriptorIds: [1],
    });
    fixtures.emptyCourse = server.create('course', {
      year: 2013,
      schoolId: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('full course count', async function(assert) {
  await visit('/courses/' + fixtures.fullCourse.id + '/publicationcheck');
  assert.equal(currentPath(), 'course.publicationCheck');
  var items = find('.course-publicationcheck table tbody td');
  assert.equal(getElementText(items.eq(0)), getText('course 0'));
  assert.equal(getElementText(items.eq(1)), getText('Yes (1)'));
  assert.equal(getElementText(items.eq(2)), getText('Yes (1)'));
  assert.equal(getElementText(items.eq(3)), getText('Yes (1)'));
  assert.equal(getElementText(items.eq(4)), getText('Yes (1)'));
});

test('empty course count', async function(assert) {
  await visit('/courses/' + fixtures.emptyCourse.id + '/publicationcheck');
  assert.equal(currentPath(), 'course.publicationCheck');
  var items = find('.course-publicationcheck table tbody td');
  assert.equal(getElementText(items.eq(0)), getText('course 1'));
  assert.equal(getElementText(items.eq(1)), getText('No'));
  assert.equal(getElementText(items.eq(2)), getText('No'));
  assert.equal(getElementText(items.eq(3)), getText('No'));
  assert.equal(getElementText(items.eq(4)), getText('No'));
});
