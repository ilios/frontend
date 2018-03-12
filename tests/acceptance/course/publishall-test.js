import { click, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: Course - Publish All Sessions', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    this.server.create('school');
    this.server.create('cohort');
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

    await click('.publish-all-sessions-publishable .title');
    assert.equal(await getElementText('tbody tr:nth-of-type(1) td:nth-of-type(1)'), getText('session 0'));
    assert.equal(await getElementText('tbody tr:nth-of-type(2) td:nth-of-type(1)'), getText('session 1'));
    assert.equal(await getElementText('tbody tr:nth-of-type(3) td:nth-of-type(1)'), getText('session 2'));
  });
});
