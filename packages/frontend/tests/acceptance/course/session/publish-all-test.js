import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/publish-all-sessions';
import sessionsPage from 'ilios-common/page-objects/sessions';

module('Acceptance | Session - Publish All', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication(
      {
        school,
        administeredSchools: [school],
      },
      true,
    );
    const vocabulary = this.server.create('vocabulary', {
      school,
    });
    this.course = this.server.create('course', { school });
    this.sessionTypes = this.server.createList('session-type', 2, {
      school,
    });
    this.term = this.server.create('term', { vocabulary });
    this.meshDescriptor = this.server.create('mesh-descriptor');
  });

  test('publish publishable sessions', async function (assert) {
    this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
      sessionObjectives: [this.server.create('session-objective')],
      offerings: this.server.createList('offering', 2),
    });
    this.server.create('session', {
      course: this.course,
      terms: [this.term],
      meshDescriptors: [this.meshDescriptor],
      sessionType: this.sessionTypes[0],
      sessionObjectives: [this.server.create('session-objective')],
      offerings: this.server.createList('offering', 2),
    });

    await sessionsPage.visit({ courseId: this.course.id });
    const { sessions } = sessionsPage.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 2);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[0].row.publicationStatus.icon.title, 'Not Published');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[1].row.publicationStatus.icon.title, 'Not Published');

    await page.visit({ courseId: this.course.id });
    const { publishableSessions } = page.publishAllSessions;
    assert.strictEqual(publishableSessions.title, 'Sessions Complete: ready to publish (2)');
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
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      offerings: this.server.createList('offering', 2),
    });
    this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
      offerings: this.server.createList('offering', 2),
    });

    await sessionsPage.visit({ courseId: this.course.id });
    const { sessions } = sessionsPage.courseSessions.sessionsGrid;
    assert.strictEqual(sessions.length, 2);
    assert.strictEqual(sessions[0].row.title, 'session 0');
    assert.strictEqual(sessions[0].row.publicationStatus.icon.title, 'Not Published');
    assert.strictEqual(sessions[1].row.title, 'session 1');
    assert.strictEqual(sessions[1].row.publicationStatus.icon.title, 'Not Published');

    await page.visit({ courseId: this.course.id });
    const { overridableSessions } = page.publishAllSessions;

    assert.strictEqual(overridableSessions.title, 'Sessions Requiring Review (2)');
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
