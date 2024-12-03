import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';

import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/course-publish-all';

module('Acceptance | Course - Publish All Sessions', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication({}, true);
    this.school = this.server.create('school');
    this.cohort = this.server.create('cohort');
  });

  test('published sessions do not appear in the cannot publish list #1658', async function (assert) {
    const meshDescriptor = this.server.create('mesh-descriptor');
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
    this.server.create('session-objective', { session: session1 });
    this.server.create('offering', { sessionId: 1 });
    const session2 = this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: false,
      meshDescriptors: [meshDescriptor],
      terms: [term],
    });
    this.server.create('session-objective', { session: session2 });

    this.server.create('offering', { session: session2 });
    this.server.create('ilm-session', { session: session2 });
    const session3 = this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: true,
      meshDescriptors: [meshDescriptor],
      terms: [term],
    });
    this.server.create('session-objective', { session: session3 });

    this.server.create('offering', { session: session3 });

    await page.visit({
      courseId: course.id,
    });
    assert.ok(page.publishAll.isVisible);
    assert.notOk(page.publishAll.hasUnlinkedWarning);
    assert.strictEqual(
      page.publishAll.unpublishableSessions.text,
      'Sessions Incomplete: cannot publish (0)',
    );
    assert.notOk(page.publishAll.unpublishableSessions.isExpanded);
    assert.ok(page.publishAll.unpublishableSessions.canExpandCollapse);

    assert.strictEqual(
      page.publishAll.publishableSessions.text,
      'Sessions Complete: ready to publish (3)',
    );
    assert.notOk(page.publishAll.publishableSessions.isExpanded);
    assert.strictEqual(page.publishAll.publishableSessions.sessions.length, 0);
    assert.ok(page.publishAll.publishableSessions.canExpandCollapse);
    await page.publishAll.publishableSessions.toggle();
    assert.ok(page.publishAll.publishableSessions.isExpanded);
    assert.strictEqual(page.publishAll.publishableSessions.sessions.length, 3);
    assert.strictEqual(page.publishAll.publishableSessions.sessions[0].title, 'session 0');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[0].offerings, 'Yes (1)');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[0].terms, 'Yes (1)');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[0].objectives.text, 'Yes (1)');
    assert.ok(page.publishAll.publishableSessions.sessions[0].objectives.isLinked);
    assert.strictEqual(page.publishAll.publishableSessions.sessions[0].meshDescriptors, 'Yes (1)');

    assert.strictEqual(page.publishAll.publishableSessions.sessions[1].title, 'session 1');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[1].offerings, 'Yes (1)');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[1].terms, 'Yes (1)');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[1].objectives.text, 'Yes (1)');
    assert.ok(page.publishAll.publishableSessions.sessions[1].objectives.isLinked);
    assert.strictEqual(page.publishAll.publishableSessions.sessions[1].meshDescriptors, 'Yes (1)');

    assert.strictEqual(page.publishAll.publishableSessions.sessions[2].title, 'session 2');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[2].offerings, 'Yes (1)');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[2].terms, 'Yes (1)');
    assert.strictEqual(page.publishAll.publishableSessions.sessions[2].objectives.text, 'Yes (1)');
    assert.ok(page.publishAll.publishableSessions.sessions[2].objectives.isLinked);
    assert.strictEqual(page.publishAll.publishableSessions.sessions[2].meshDescriptors, 'Yes (1)');
  });

  test('After publishing user is returned to the courses route #4099', async function (assert) {
    const meshDescriptors = this.server.createList('mesh-descriptor', 1);
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
    this.server.create('session-objective', { session });
    this.server.create('session-type', {
      sessions: [session],
    });
    this.server.create('offering', { session });

    await page.visit({
      courseId: course.id,
    });
    assert.ok(page.publishAll.isVisible);
    await page.publishAll.review.save();
    assert.strictEqual(currentURL(), '/courses/1');
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
    this.server.create('session-type', {
      sessions: [session],
    });
    await page.visit({
      courseId: course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.ok(page.publishAll.isVisible);
    assert.ok(page.publishAll.hasUnlinkedWarning);

    await page.details.objectives.objectiveList.objectives[0].parents.manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;
    await m.competencies[0].objectives[0].add();
    await page.details.objectives.objectiveList.objectives[0].parents.save();
    assert.notOk(page.publishAll.hasUnlinkedWarning);
  });
});
