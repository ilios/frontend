import { click, find, visit } from '@ember/test-helpers';
import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Course - Publish All Sessions', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    this.server.create('school');
    this.server.create('cohort');
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('published sessions do not appear in the cannot publish list #1658', async function(assert) {
    this.server.create('objective');
    this.server.create('objective');
    this.server.create('objective');
    this.server.create('meshDescriptor');
    this.server.create('term');

    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      cohortIds: [1],
    });
    this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: false,
      objectiveIds: [1],
      meshDescriptorIds: [1],
      termIds: [1],
    });
    this.server.create('offering', {sessionId: 1});
    this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: false,
      objectiveIds: [2],
      meshDescriptorIds: [1],
      termIds: [1],
    });
    this.server.create('offering', {sessionId: 2});
    this.server.create('ilmSession', { sessionId: 2});
    this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: true,
      objectiveIds: [3],
      meshDescriptorIds: [1],
      termIds: [1],
    });
    this.server.create('offering', {sessionId: 3});
    await visit('/courses/1/publishall');

    let publishable = find('.publish-all-sessions-publishable');
    await click(find('.title', publishable));
    assert.equal(getElementText(find(find('tbody tr:eq(0) td'))), getText('session 0'));
    assert.equal(getElementText(find(find('tbody tr:eq(1) td'))), getText('session 1'));
    assert.equal(getElementText(find(find('tbody tr:eq(2) td'))), getText('session 2'));
  });
});
