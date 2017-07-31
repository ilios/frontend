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
    server.create('cohort', {
      courses: [1],
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('published sessions do not appear in the cannot publish list #1658', async function(assert) {
  server.create('offering', { session: 1 });
  server.create('offering', { session: 2 });
  server.create('offering', { session: 3 });
  server.create('objective', { sessions: [1] });
  server.create('objective', { sessions: [2] });
  server.create('objective', { sessions: [3] });
  server.create('meshDescriptor', { sessions: [1, 2, 3] });
  server.create('term', { sessions: [1, 2, 3] });

  server.create('course', {
    year: 2013,
    school: 1,
    published: true,
    cohorts: [1],
    sessions: [1, 2, 3],
  });
  server.create('session', {
    course: 1,
    published: true,
    publishedAsTbd: false,
    offerings: [1],
    objectives: [1],
    meshDescriptors: [1],
    terms: [1],
  });
  server.create('session', {
    course: 1,
    published: true,
    publishedAsTbd: false,
    ilmSession: 1,
    offerings: [2],
    objectives: [2],
    meshDescriptors: [1],
    terms: [1],
  });
  server.create('ilmSession', { session: 2});
  server.create('session', {
    course: 1,
    published: true,
    publishedAsTbd: true,
    offerings: [3],
    objectives: [3],
    meshDescriptors: [1],
    terms: [1],
  });
  await visit('/courses/1/publishall');

  let publishable = find('.publish-all-sessions-publishable');
  await click(find('.clickable', publishable));
  assert.equal(getElementText(find('tbody tr:eq(0) td:eq(0)')), getText('session 0'));
  assert.equal(getElementText(find('tbody tr:eq(1) td:eq(0)')), getText('session 1'));
  assert.equal(getElementText(find('tbody tr:eq(2) td:eq(0)')), getText('session 2'));
});
