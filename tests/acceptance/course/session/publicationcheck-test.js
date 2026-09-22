import { currentRouteName, currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session-publication-check';

module('Acceptance | Session - Publication Check', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    const vocabulary = await this.server.create('vocabulary', {
      school,
    });
    this.course = await this.server.create('course', { school });
    this.sessionTypes = await this.server.createList('session-type', 2, {
      school,
    });
    this.term = await this.server.create('term', { vocabulary });
    await setupAuthentication({ directedCourses: [this.course] });
  });

  test('full session count', async function (assert) {
    const session = await this.server.create('session', {
      course: this.course,
      terms: [this.term],
      sessionType: this.sessionTypes[0],
    });
    await this.server.create('session-objective', { session });
    await this.server.create('offering', { session });
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    await takeScreenshot(assert);
    assert.strictEqual(currentRouteName(), 'session.publication-check');
    assert.strictEqual(page.publicationcheck.sessionTitle, 'session 0');
    assert.strictEqual(page.publicationcheck.offerings, 'Yes (1)');
    assert.strictEqual(page.publicationcheck.terms, 'Yes (1)');
    assert.strictEqual(page.publicationcheck.objectives, 'Yes (1)');
  });

  test('empty session count', async function (assert) {
    const session = await this.server.create('session', {
      course: this.course,
    });
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    await takeScreenshot(assert);
    assert.strictEqual(page.publicationcheck.sessionTitle, 'session 0');
    assert.strictEqual(page.publicationcheck.offerings, 'No');
    assert.strictEqual(page.publicationcheck.terms, 'No');
    assert.strictEqual(page.publicationcheck.objectives, 'No');
  });

  test('unlink icon transitions properly', async function (assert) {
    const session = await this.server.create('session', {
      course: this.course,
      sessionType: this.sessionTypes[0],
    });
    await this.server.create('session-objective', { session });
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    await page.publicationcheck.unlink.click();
    assert.ok(currentURL().startsWith('/courses/1/sessions/1'));
    assert.ok(currentURL().includes('sessionObjectiveDetails=true'));
  });
});
