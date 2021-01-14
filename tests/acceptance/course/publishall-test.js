import { click, visit, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication, getElementText, getText } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course-publish-all';

module('Acceptance | Course - Publish All Sessions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.cohort = this.server.create('cohort');
  });

  test('published sessions do not appear in the cannot publish list #1658', async function (assert) {
    const meshDescriptor = this.server.create('meshDescriptor');
    const term = this.server.create('term');

    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      published: true,
      cohorts: [this.cohort],
    });
    const session1 = this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: false,
      meshDescriptors: [meshDescriptor],
      terms: [term],
    });
    this.server.create('sessionObjective', { session: session1 });
    this.server.create('offering', { sessionId: 1 });
    const session2 = this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: false,
      meshDescriptors: [meshDescriptor],
      terms: [term],
    });
    this.server.create('sessionObjective', { session: session2 });

    this.server.create('offering', { session: session2 });
    this.server.create('ilmSession', { session: session2 });
    const session3 = this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: true,
      meshDescriptors: [meshDescriptor],
      terms: [term],
    });
    this.server.create('sessionObjective', { session: session3 });

    this.server.create('offering', { session: session3 });
    await visit('/courses/1/publishall');

    await click('.publish-all-sessions-publishable .title');
    assert.equal(
      await getElementText('tbody tr:nth-of-type(1) td:nth-of-type(1)'),
      getText('session 0')
    );
    assert.equal(
      await getElementText('tbody tr:nth-of-type(2) td:nth-of-type(1)'),
      getText('session 1')
    );
    assert.equal(
      await getElementText('tbody tr:nth-of-type(3) td:nth-of-type(1)'),
      getText('session 2')
    );
  });

  test('After publishing user is returned to the courses route #4099', async function (assert) {
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
      meshDescriptors,
      terms,
    });
    this.server.create('sessionObjective', { session });
    this.server.create('sessionType', {
      sessions: [session],
    });
    this.server.create('offering', { session });
    await visit('/courses/1/publishall');

    await click('.publish-all-sessions-review button');
    assert.equal(currentURL(), '/courses/1');
    assert.ok(session.published);
  });

  test('Updating course objectives updates the unlinked objective warning', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const programYear = this.server.create('program-year', {
      cohort: this.cohort,
    });
    this.server.create('program', {
      school: this.school,
      programYears: [programYear],
    });
    this.server.create('program-year-objective', {
      programYear,
    });

    const course = this.server.create('course', {
      year: 2020,
      school: this.school,
      published: true,
      cohorts: [this.cohort],
    });
    this.server.create('course-objective', {
      course,
    });
    const session = this.server.create('session', {
      course,
      published: false,
      publishedAsTbd: false,
    });
    this.server.create('sessionType', {
      sessions: [session],
    });
    await page.visit({
      courseId: 1,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.ok(page.publishAll.isVisible);
    assert.ok(page.publishAll.hasUnlinkedWarning);

    await page.course.objectives.objectiveList.objectives[0].parents.list[0].manage();
    const m = page.course.objectives.objectiveList.objectives[0].parentManager;
    await m.competencies[0].objectives[0].add();
    await page.course.objectives.objectiveList.objectives[0].parents.save();
    assert.notOk(page.publishAll.hasUnlinkedWarning);
  });
});
