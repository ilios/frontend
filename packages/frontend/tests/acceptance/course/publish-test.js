import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { currentURL } from '@ember/test-helpers';
import page from 'ilios-common/page-objects/course';
import pubcheckPage from 'ilios-common/page-objects/course-publication-check';

module('Acceptance | Course - Publish', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    this.user = await setupAuthentication({ administeredSchools: [this.school] });
    this.cohort = await this.server.create('cohort');
  });

  test('check publish draft course', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
    });
    await page.visit({ courseId: course.id });

    assert.strictEqual(currentURL(), '/courses/1', 'course page url is correct');
    assert.strictEqual(
      page.details.header.publicationMenu.toggle.text,
      'Not Published',
      'course published status is correct',
    );

    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publishAsIs();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Missing Items (2)');
    assert.strictEqual(pubcheck.courseTitle, 'course 0');
    assert.strictEqual(pubcheck.cohorts, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');
    assert.strictEqual(
      pubcheck.publishWithMissingItems.text,
      'Publish Course, with 2 items missing',
    );

    await pubcheckPage.publicationcheck.publishWithMissingItems.click();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
  });

  test('check schedule draft course', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Not Published');
    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.markAsScheduled();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Scheduled');
  });

  test('check publish scheduled course', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
      published: true,
      publishedAsTbd: true,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Scheduled');
    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publishAsIs();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Missing Items (2)');
    assert.strictEqual(pubcheck.courseTitle, 'course 0');
    assert.strictEqual(pubcheck.cohorts, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');
    assert.strictEqual(
      pubcheck.publishWithMissingItems.text,
      'Publish Course, with 2 items missing',
    );

    await pubcheckPage.publicationcheck.publishWithMissingItems.click();

    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
  });

  test('check unpublish scheduled course', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
      published: true,
      publishedAsTbd: true,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Scheduled');
    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.unpublishCourse();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Not Published');
  });

  test('check schedule published course', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
      published: true,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.markAsScheduled();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Scheduled');
  });

  test('check unpublish published course', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
      published: true,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.unpublishCourse();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Not Published');
  });
});
