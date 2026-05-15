import { currentRouteName } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session';

module('Acceptance | Session - Publish', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    freezeDateAt(
      DateTime.fromObject({
        month: 3,
        day: 15,
      }).toJSDate(),
    );
    const school = await this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [school] }, true);
    this.course = await this.server.create('course', { school });
    const sessionType = await this.server.create('session-type');
    this.publishedSession = await this.server.create('session', {
      published: true,
      course: this.course,
      sessionType,
    });
    this.scheduledSession = await this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: true,
      sessionType,
    });
    this.draftSession = await this.server.create('session', {
      course: this.course,
      sessionType,
    });
    this.ilmSession = await this.server.create('session', {
      course: this.course,
      sessionType,
    });
    await this.server.create('ilm-session', {
      session: this.ilmSession,
      dueDate: DateTime.now().toISO(),
    });
    await this.server.create('offering', {
      session: this.publishedSession,
      startDate: DateTime.now().toISO(),
      endDate: DateTime.now().plus({ hours: 6 }).toISO(),
    });
    await this.server.create('offering', {
      session: this.scheduledSession,
      startDate: DateTime.now().toISO(),
      endDate: DateTime.now().plus({ hours: 6 }).toISO(),
    });
    await this.server.create('offering', {
      session: this.draftSession,
      startDate: DateTime.now().toISO(),
      endDate: DateTime.now().plus({ hours: 6 }).toISO(),
    });
  });

  hooks.afterEach(() => {
    unfreezeDate();
  });

  test('check published session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.publishedSession.id });
    assert.strictEqual(currentRouteName(), 'session.index');
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Published');
    await page.details.overview.publicationMenu.toggle.click();
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 3);
    assert.strictEqual(
      page.details.overview.publicationMenu.buttons[0].text,
      'Review 2 Missing Items',
    );
    assert.strictEqual(page.details.overview.publicationMenu.buttons[1].text, 'Mark as Scheduled');
    assert.strictEqual(page.details.overview.publicationMenu.buttons[2].text, 'UnPublish Session');
  });

  test('check scheduled session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.scheduledSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
    await page.details.overview.publicationMenu.toggle.click();
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 3);
    assert.strictEqual(page.details.overview.publicationMenu.buttons[0].text, 'Publish As-is');
    assert.strictEqual(
      page.details.overview.publicationMenu.buttons[1].text,
      'Review 2 Missing Items',
    );
    assert.strictEqual(page.details.overview.publicationMenu.buttons[2].text, 'UnPublish Session');
  });

  test('check draft session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.draftSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
    await page.details.overview.publicationMenu.toggle.click();
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 3);
    assert.strictEqual(page.details.overview.publicationMenu.buttons[0].text, 'Publish As-is');
    assert.strictEqual(
      page.details.overview.publicationMenu.buttons[1].text,
      'Review 2 Missing Items',
    );
    assert.strictEqual(page.details.overview.publicationMenu.buttons[2].text, 'Mark as Scheduled');
  });

  test('check publish draft session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.draftSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publishAsIs();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Published');
  });

  test('check schedule draft session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.draftSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.markAsScheduled();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
  });

  test('check publish scheduled session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.scheduledSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publishAsIs();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Published');
  });

  test('check unpublish scheduled session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.scheduledSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.unpublishSession();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
  });

  test('check schedule published session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.publishedSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Published');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.markAsScheduled();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
  });

  test('check unpublish published session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.publishedSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Published');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.unpublishSession();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
  });

  test('check publish requirements for ilm session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.ilmSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
    await page.details.overview.publicationMenu.toggle.click();
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 3);
    assert.strictEqual(page.details.overview.publicationMenu.buttons[0].text, 'Publish As-is');
    assert.strictEqual(
      page.details.overview.publicationMenu.buttons[1].text,
      'Review 2 Missing Items',
    );
    assert.strictEqual(page.details.overview.publicationMenu.buttons[2].text, 'Mark as Scheduled');
  });
});
