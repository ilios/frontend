import { currentRouteName, currentURL } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { module, test } from 'qunit';
import { setupAuthentication, freezeDateAt, unfreezeDate } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session';
import pubcheckPage from 'ilios-common/page-objects/session-publication-check';

module('Acceptance | Session - Publish', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    freezeDateAt(
      DateTime.fromObject({
        month: 3,
        day: 15,
      }).toJSDate(),
    );
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school, administeredSchools: [this.school] });
    this.course = await this.server.create('course', { school: this.school });
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
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 2);
    assert.strictEqual(page.details.overview.publicationMenu.buttons[0].text, 'Mark as Scheduled');
    assert.strictEqual(page.details.overview.publicationMenu.buttons[1].text, 'UnPublish Session');
  });

  test('check scheduled session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.scheduledSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
    await page.details.overview.publicationMenu.toggle.click();
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 2);
    assert.strictEqual(page.details.overview.publicationMenu.buttons[0].text, 'Publish');
    assert.strictEqual(page.details.overview.publicationMenu.buttons[1].text, 'UnPublish Session');
  });

  test('check draft session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.draftSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
    await page.details.overview.publicationMenu.toggle.click();
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 2);
    assert.strictEqual(page.details.overview.publicationMenu.buttons[0].text, 'Publish');
    assert.strictEqual(page.details.overview.publicationMenu.buttons[1].text, 'Mark as Scheduled');
  });

  test('check publish draft session, missing requirements', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
    });
    const sessionType = await this.server.create('session-type');
    const session = await this.server.create('session', {
      course,
      sessionType,
    });
    await page.visit({ courseId: course.id, sessionId: session.id });

    assert.strictEqual(currentURL(), '/courses/2/sessions/5', 'session page url is correct');
    assert.strictEqual(
      page.details.overview.publicationMenu.toggle.text,
      'Not Published',
      'session published status is correct',
    );

    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/2/sessions/5/publicationcheck',
      'session publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (3)');
    assert.strictEqual(pubcheck.sessionTitle, 'session 4');
    assert.strictEqual(pubcheck.offerings, 'No');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');

    assert.ok(pubcheck.publishMissingRequirements);
    assert.ok(pubcheck.publishMissingRequirements.isDisabled);
    assert.strictEqual(pubcheck.publishMissingRequirements.text, 'Publish Session');
  });

  test('check publish draft session, missing items', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
    });
    const sessionType = await this.server.create('session-type');
    const session = await this.server.create('session', {
      course,
      sessionType,
    });
    await this.server.create('offering', {
      session,
      startDate: DateTime.now().toISO(),
      endDate: DateTime.now().plus({ hours: 1 }).toISO(),
    });
    await page.visit({ courseId: course.id, sessionId: session.id });

    assert.strictEqual(currentURL(), '/courses/2/sessions/5', 'session page url is correct');
    assert.strictEqual(
      page.details.overview.publicationMenu.toggle.text,
      'Not Published',
      'session published status is correct',
    );

    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/2/sessions/5/publicationcheck',
      'session publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (2)');
    assert.strictEqual(pubcheck.sessionTitle, 'session 4');
    assert.strictEqual(pubcheck.offerings, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');

    assert.ok(pubcheck.publishWithMissingItems);
    assert.strictEqual(
      pubcheck.publishWithMissingItems.text,
      'Publish Session, with 2 items missing',
    );
  });

  test('check publish draft session, all items set', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
    });
    const sessionType = await this.server.create('session-type');
    const session = await this.server.create('session', {
      course,
      sessionType,
      terms: [await this.server.create('term')],
      sessionObjectives: [await this.server.create('session-objective')],
    });
    await this.server.create('offering', {
      session,
      startDate: DateTime.now().toISO(),
      endDate: DateTime.now().plus({ hours: 1 }).toISO(),
    });
    await page.visit({ courseId: course.id, sessionId: session.id });

    assert.strictEqual(currentURL(), '/courses/2/sessions/5', 'session page url is correct');
    assert.strictEqual(
      page.details.overview.publicationMenu.toggle.text,
      'Not Published',
      'session published status is correct',
    );

    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/2/sessions/5/publicationcheck',
      'session publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (0)');
    assert.strictEqual(pubcheck.sessionTitle, 'session 4');
    assert.strictEqual(pubcheck.offerings, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'Yes (1)');
    assert.strictEqual(pubcheck.objectives, 'Yes (1)');

    assert.ok(pubcheck.publish);
    assert.strictEqual(pubcheck.publish.text, 'Publish Session');

    await pubcheck.publish.click();

    assert.strictEqual(currentURL(), '/courses/2/sessions/5', 'session page url is correct');
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Published');
  });

  test('check schedule draft session', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.draftSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Not Published');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.markAsScheduled();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
  });

  test('check publish scheduled session, missing requirements', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
    });
    const sessionType = await this.server.create('session-type');
    const session = await this.server.create('session', {
      course,
      sessionType,
      published: true,
      publishedAsTbd: true,
    });
    await page.visit({ courseId: course.id, sessionId: session.id });

    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/2/sessions/5/publicationcheck',
      'session publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (3)');
    assert.strictEqual(pubcheck.sessionTitle, 'session 4');
    assert.strictEqual(pubcheck.offerings, 'No');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');

    assert.ok(pubcheck.publishMissingRequirements);
    assert.ok(pubcheck.publishMissingRequirements.isDisabled);
    assert.strictEqual(pubcheck.publishMissingRequirements.text, 'Publish Session');
  });

  test('check publish scheduled session, missing items', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: this.scheduledSession.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/1/sessions/2/publicationcheck',
      'session publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (2)');
    assert.strictEqual(pubcheck.sessionTitle, 'session 1');
    assert.strictEqual(pubcheck.offerings, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');

    assert.ok(pubcheck.publishWithMissingItems);
    assert.strictEqual(
      pubcheck.publishWithMissingItems.text,
      'Publish Session, with 2 items missing',
    );

    await pubcheck.publishWithMissingItems.click();
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Published');
  });

  test('check publish scheduled session, all items set', async function (assert) {
    const course = await this.server.create('course', {
      school: this.school,
    });
    const sessionType = await this.server.create('session-type');
    const session = await this.server.create('session', {
      course,
      sessionType,
      published: true,
      publishedAsTbd: true,
      terms: [await this.server.create('term')],
      sessionObjectives: [await this.server.create('session-objective')],
    });
    await this.server.create('offering', {
      session,
      startDate: DateTime.now().toISO(),
      endDate: DateTime.now().plus({ hours: 1 }).toISO(),
    });

    await page.visit({ courseId: course.id, sessionId: session.id });
    assert.strictEqual(page.details.overview.publicationMenu.toggle.text, 'Scheduled');
    await page.details.overview.publicationMenu.toggle.click();
    await page.details.overview.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/2/sessions/5/publicationcheck',
      'session publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (0)');
    assert.strictEqual(pubcheck.sessionTitle, 'session 4');
    assert.strictEqual(pubcheck.offerings, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'Yes (1)');
    assert.strictEqual(pubcheck.objectives, 'Yes (1)');

    assert.ok(pubcheck.publishWithMissingItems);
    assert.strictEqual(pubcheck.publish.text, 'Publish Session');

    await pubcheck.publish.click();
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
    assert.strictEqual(page.details.overview.publicationMenu.buttons.length, 2);
    assert.strictEqual(page.details.overview.publicationMenu.buttons[0].text, 'Publish');
    assert.strictEqual(page.details.overview.publicationMenu.buttons[1].text, 'Mark as Scheduled');
  });
});
