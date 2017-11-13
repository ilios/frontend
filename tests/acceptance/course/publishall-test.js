import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Course - Publish All Sessions', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('cohort');
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('published sessions do not appear in the cannot publish list #1658', async function(assert) {
  server.create('objective');
  server.create('objective');
  server.create('objective');
  server.create('meshDescriptor');
  server.create('term');

  server.create('course', {
    year: 2013,
    schoolId: 1,
    published: true,
    cohortIds: [1],
  });
  server.create('session', {
    courseId: 1,
    published: true,
    publishedAsTbd: false,
    objectiveIds: [1],
    meshDescriptorIds: [1],
    termIds: [1],
  });
  server.create('offering', {sessionId: 1});
  server.create('session', {
    courseId: 1,
    published: true,
    publishedAsTbd: false,
    objectiveIds: [2],
    meshDescriptorIds: [1],
    termIds: [1],
  });
  server.create('offering', {sessionId: 2});
  server.create('ilmSession', { sessionId: 2});
  server.create('session', {
    courseId: 1,
    published: true,
    publishedAsTbd: true,
    objectiveIds: [3],
    meshDescriptorIds: [1],
    termIds: [1],
  });
  server.create('offering', {sessionId: 3});
  await visit('/courses/1/publishall');

  let publishable = find('.publish-all-sessions-publishable');
  await click(find('.clickable', publishable));
  assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)')), getText('session 0'));
  assert.equal(getElementText(find('tbody tr:eq(1) td:eq(0)')), getText('session 1'));
  assert.equal(getElementText(find('tbody tr:eq(2) td:eq(0)')), getText('session 2'));
});
