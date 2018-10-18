import { click, visit, currentURL } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { getElementText, getText } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Course - Publish All Sessions', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    this.school = this.server.create('school');
    this.cohort = this.server.create('cohort');
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

  test('After publishing user is returned to the courses route #4099', async function(assert) {
    const objectives = this.server.createList('objective', 1);
    const meshDescriptors = this.server.createList('meshDescriptor', 1);
    const terms = this.server.createList('term', 1);

    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      published: true,
      cohorts: [this.cohort],
    });
    const session = this.server.create('session', {
      course,
      published: false,
      publishedAsTbd: false,
      objectives,
      meshDescriptors,
      terms,
    });
    this.server.create('offering', { session });
    await visit('/courses/1/publishall');

    await click('.publish-all-sessions-review button');
    assert.equal(currentURL(), '/courses/1');
    assert.ok(session.published);
  });
});
