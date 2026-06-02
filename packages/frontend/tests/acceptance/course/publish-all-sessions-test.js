import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/components/course/publish-all-sessions';

module('Acceptance | Course - Publish All Sessions', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    this.user = await setupAuthentication({ administeredSchools: [this.school] }, true);
    this.cohort = await this.server.create('cohort');

    const vocabulary = await this.server.create('vocabulary', {
      school: this.school,
    });
    // this.course = await this.server.create('course', { school: this.school });
    this.course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      published: true,
      cohorts: [this.cohort],
    });
    this.sessionTypes = await this.server.createList('session-type', 2, {
      school: this.school,
    });
    this.term = await this.server.create('term', { vocabulary });
    this.meshDescriptor = await this.server.create('mesh-descriptor');
  });

  test('published sessions do not appear in the cannot publish list #1658', async function (assert) {
    const term = await this.server.create('term');
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      published: true,
      cohorts: [this.cohort],
    });
    const session1 = await this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: false,
      terms: [term],
    });
    await this.server.create('session-objective', { session: session1 });
    await this.server.create('offering', { session: session1 });
    const session2 = await this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: false,
      terms: [term],
    });
    await this.server.create('session-objective', { session: session2 });
    await this.server.create('offering', { session: session2 });
    await this.server.create('ilm-session', { session: session2 });
    const session3 = await this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: true,
      terms: [term],
    });
    await this.server.create('session-objective', { session: session3 });
    await this.server.create('offering', { session: session3 });

    await page.visit({
      courseId: course.id,
    });

    assert.ok(page.publishAllSessions.isVisible);
    assert.notOk(page.publishAllSessions.hasUnlinkedWarning);
    assert.strictEqual(
      page.publishAllSessions.unpublishableSessions.text,
      'Incomplete Sessions: cannot publish (0)',
    );
    assert.notOk(page.publishAllSessions.unpublishableSessions.isExpanded);
    assert.ok(page.publishAllSessions.unpublishableSessions.canExpandCollapse);

    assert.strictEqual(page.publishAllSessions.publishableSessions.text, 'Published Sessions (3)');
    assert.notOk(page.publishAllSessions.publishableSessions.isExpanded);
    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions.length, 0);
    assert.ok(page.publishAllSessions.publishableSessions.canExpandCollapse);
    await page.publishAllSessions.publishableSessions.toggle();
    assert.ok(page.publishAllSessions.publishableSessions.isExpanded);
    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions.length, 3);
    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions[0].title, 'session 0');
    assert.strictEqual(
      page.publishAllSessions.publishableSessions.sessions[0].offerings,
      'Yes (1)',
    );
    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions[0].terms, 'Yes (1)');
    assert.strictEqual(
      page.publishAllSessions.publishableSessions.sessions[0].objectives.text,
      'Yes (1)',
    );
    assert.ok(page.publishAllSessions.publishableSessions.sessions[0].objectives.isLinked);

    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions[1].title, 'session 1');
    assert.strictEqual(
      page.publishAllSessions.publishableSessions.sessions[1].offerings,
      'Yes (1)',
    );
    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions[1].terms, 'Yes (1)');
    assert.strictEqual(
      page.publishAllSessions.publishableSessions.sessions[1].objectives.text,
      'Yes (1)',
    );
    assert.ok(page.publishAllSessions.publishableSessions.sessions[1].objectives.isLinked);

    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions[2].title, 'session 2');
    assert.strictEqual(
      page.publishAllSessions.publishableSessions.sessions[2].offerings,
      'Yes (1)',
    );
    assert.strictEqual(page.publishAllSessions.publishableSessions.sessions[2].terms, 'Yes (1)');
    assert.strictEqual(
      page.publishAllSessions.publishableSessions.sessions[2].objectives.text,
      'Yes (1)',
    );
    assert.ok(page.publishAllSessions.publishableSessions.sessions[2].objectives.isLinked);
  });

  test('After publishing user is returned to the courses route #4099', async function (assert) {
    const terms = await this.server.createList('term', 1);

    // const course = await this.server.create('course', {
    //   year: 2013,
    //   school: this.school,
    //   published: true,
    //   cohorts: [this.cohort],
    // });
    const session = await this.server.create('session', {
      course: this.course,
      published: false,
      publishedAsTbd: false,
      terms,
    });
    await this.server.create('session-objective', { session });
    await this.server.create('session-type', {
      sessions: [session],
    });
    await this.server.create('offering', { session });

    await page.visit({
      courseId: this.course.id,
    });

    assert.ok(page.publishAllSessions.isVisible);
    await page.publishAllSessions.review.save();
    assert.strictEqual(currentURL(), '/courses/1');
    assert.strictEqual(
      page.courseSessions.sessionsGrid.sessions[0].row.publicationStatus.icon.title,
      'Published',
    );
  });

  test('Updating course objectives updates the unlinked objective warning', async function (assert) {
    const programYear = await this.server.create('program-year', {
      cohort: this.cohort,
    });
    await this.server.create('program', {
      school: this.school,
      programYears: [programYear],
    });
    await this.server.create('program-year-objective', {
      programYear,
    });

    const course = await this.server.create('course', {
      year: 2020,
      school: this.school,
      published: true,
      cohorts: [this.cohort],
    });
    await this.server.create('course-objective', {
      course,
    });
    const session = await this.server.create('session', {
      course,
      published: false,
      publishedAsTbd: false,
    });
    await this.server.create('session-type', {
      sessions: [session],
    });
    await page.visit({
      courseId: course.id,
      details: true,
      courseObjectiveDetails: true,
    });
    assert.ok(page.publishAllSessions.isVisible);
    assert.ok(page.publishAllSessions.hasUnlinkedWarning);

    await page.details.objectives.objectiveList.objectives[0].parents.manage();
    const m = page.details.objectives.objectiveList.objectives[0].parentManager;
    await m.competencies[0].objectives[0].add();
    await page.details.objectives.objectiveList.objectives[0].parents.save();
    assert.notOk(page.publishAllSessions.hasUnlinkedWarning);
  });

  test('expand/collapse state of sections are tracked in url', async function (assert) {
    const sessionObjectives = await this.server.createList('session-objective', 2);
    const offerings = await this.server.createList('offering', 4);
    await this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
      sessionObjectives: [sessionObjectives[0]],
      offerings: [offerings[0], offerings[1]],
    });

    await this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
      sessionObjectives: [sessionObjectives[1]],
      offerings: [offerings[2], offerings[3]],
    });

    await page.visit({
      courseId: this.course.id,
    });

    assert.strictEqual(currentURL(), '/courses/1/publishall');

    const { publishableSessions, unpublishableSessions } = page.publishAllSessions;

    assert.notOk(publishableSessions.isExpanded);
    assert.notOk(unpublishableSessions.isExpanded);

    await publishableSessions.toggle();
    assert.strictEqual(currentURL(), '/courses/1/publishall?expandCompleteSessions=true');
    assert.ok(publishableSessions.isExpanded);
    assert.notOk(unpublishableSessions.isExpanded);
    await unpublishableSessions.toggle();
    assert.strictEqual(
      currentURL(),
      '/courses/1/publishall?expandCompleteSessions=true&expandIncompleteSessions=true',
    );
    assert.ok(publishableSessions.isExpanded);
    assert.ok(unpublishableSessions.isExpanded);
    await publishableSessions.toggle();
    assert.strictEqual(currentURL(), '/courses/1/publishall?expandIncompleteSessions=true');
    assert.notOk(publishableSessions.isExpanded);
    assert.ok(unpublishableSessions.isExpanded);
    await unpublishableSessions.toggle();
    assert.strictEqual(currentURL(), '/courses/1/publishall');
    assert.notOk(publishableSessions.isExpanded);
    assert.notOk(unpublishableSessions.isExpanded);
  });

  test('publish publishable sessions', async function (assert) {
    await this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
      sessionObjectives: [await this.server.create('session-objective')],
      offerings: await this.server.createList('offering', 2),
    });
    await this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
      sessionObjectives: [await this.server.create('session-objective')],
      offerings: await this.server.createList('offering', 2),
    });

    await page.coursePage.visit({
      courseId: this.course.id,
    });

    const { sessions } = page.coursePage.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 2, 'course sessions length correct');
    assert.strictEqual(sessions[0].row.title, 'session 0', 'first course session title correct');
    assert.strictEqual(
      sessions[0].row.publicationStatus.icon.title,
      'Not Published',
      'first session is unpublished',
    );
    assert.strictEqual(sessions[1].row.title, 'session 1', 'second course session title correct');
    assert.strictEqual(
      sessions[1].row.publicationStatus.icon.title,
      'Not Published',
      'second course session is unpublished',
    );

    await page.visit({
      courseId: this.course.id,
    });

    const { publishableSessions } = page.publishAllSessions;
    assert.strictEqual(
      publishableSessions.title,
      'Published Sessions (2)',
      'publishable sessions header correct',
    );
    await publishableSessions.toggle();
    assert.strictEqual(publishableSessions.sessions.length, 2);
    assert.strictEqual(publishableSessions.sessions[0].title, 'session 0');
    assert.strictEqual(publishableSessions.sessions[0].url, '/courses/1/sessions/1');
    assert.strictEqual(publishableSessions.sessions[1].title, 'session 1');
    assert.strictEqual(publishableSessions.sessions[1].url, '/courses/1/sessions/2');

    assert.strictEqual(
      page.publishAllSessions.review.confirmation,
      'Publish 2, schedule 0, and ignore 0 sessions',
    );

    await page.publishAllSessions.review.save();
    assert.strictEqual(sessions.length, 2);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[0].row.publicationStatus.icon.title, 'Published');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[1].row.publicationStatus.icon.title, 'Published');
  });

  test('publish overridable sessions #2816', async function (assert) {
    await this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      offerings: await this.server.createList('offering', 2),
    });
    await this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      offerings: await this.server.createList('offering', 2),
    });

    await page.coursePage.visit({
      courseId: this.course.id,
    });

    const { sessions } = page.coursePage.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 2);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[0].row.publicationStatus.icon.title, 'Not Published');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[1].row.publicationStatus.icon.title, 'Not Published');

    await page.visit({
      courseId: this.course.id,
    });

    const { overridableSessions } = page.publishAllSessions;

    assert.strictEqual(overridableSessions.title, 'Unpublished Sessions: for review (2)');
    assert.ok(overridableSessions.markAllAsScheduled.isVisible);
    assert.ok(overridableSessions.publishAllAsIs.isVisible);
    const { sessions: list } = overridableSessions;
    assert.strictEqual(list.length, 2);
    assert.strictEqual(list[0].title, 'session 0');
    assert.strictEqual(list[0].url, '/courses/1/sessions/1');
    assert.notOk(list[0].publishAsIs.isChecked);
    assert.ok(list[0].markAsScheduled.isChecked);
    assert.strictEqual(list[1].title, 'session 1');
    assert.strictEqual(list[1].url, '/courses/1/sessions/2');
    assert.notOk(list[1].publishAsIs.isChecked);
    assert.ok(list[1].markAsScheduled.isChecked);

    await overridableSessions.publishAllAsIs.click();
    assert.ok(list[0].publishAsIs.isChecked);
    assert.notOk(list[0].markAsScheduled.isChecked);
    assert.ok(list[1].publishAsIs.isChecked);
    assert.notOk(list[1].markAsScheduled.isChecked);

    assert.strictEqual(
      page.publishAllSessions.review.confirmation,
      'Publish 2, schedule 0, and ignore 0 sessions',
    );

    await page.publishAllSessions.review.save();
    assert.strictEqual(sessions.length, 2);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[0].row.publicationStatus.icon.title, 'Published');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[1].row.publicationStatus.icon.title, 'Published');
  });
});
