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
    this.programYearObjective = await this.server.create('program-year-objective');
    this.term = await this.server.create('term');
    this.courseObjective = await this.server.create('course-objective');
  });

  test('check publish draft course, missing requirements', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [],
    });
    await page.visit({ courseId: course.id });

    assert.strictEqual(currentURL(), '/courses/1', 'course page url is correct');
    assert.strictEqual(
      page.details.header.publicationMenu.toggle.text,
      'Not Published',
      'course published status is correct',
    );
    assert.ok(page.details.hasCollapseControl, 'course has collapse control');

    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );
    assert.notOk(page.details.hasCollapseControl, 'course does not have collapse control anymore');

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(
      pubcheck.title,
      'Publication Review',
      'course publication review title correct',
    );
    assert.strictEqual(
      pubcheck.missingItemsTitle,
      'Missing Items (3)',
      'course missing items correct',
    );
    assert.strictEqual(pubcheck.courseTitle, 'course 0', 'course title correct');
    assert.strictEqual(pubcheck.cohorts, 'No', 'course cohort count correct');
    assert.strictEqual(pubcheck.terms, 'No', 'course terms count correct');
    assert.strictEqual(pubcheck.objectives, 'No', 'course objectives count correct');

    // await this.pauseTest();

    // assert.notOk(
    //   pubcheck.publishWithMissingItems,
    //   'publish with misssing items button not visible',
    // );
    // assert.notOk(pubcheck.publish, 'publish button not visible');

    assert.ok(pubcheck.publishMissingRequirements, 'publish missing requirements button visible');
    assert.ok(pubcheck.publishMissingRequirements.isDisabled, 'publish course button disabled');
    assert.strictEqual(
      pubcheck.publishMissingRequirements.text,
      'Publish Course',
      'publish course button text correct',
    );
  });

  test('check publish draft course, missing items', async function (assert) {
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
    assert.ok(page.details.hasCollapseControl, 'course has collapse control');

    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );
    assert.notOk(page.details.hasCollapseControl, 'course does not have collapse control anymore');

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(
      pubcheck.title,
      'Publication Review',
      'course publication review title correct',
    );
    assert.strictEqual(
      pubcheck.missingItemsTitle,
      'Missing Items (2)',
      'course missing items correct',
    );
    assert.strictEqual(pubcheck.courseTitle, 'course 0', 'course title correct');
    assert.strictEqual(pubcheck.cohorts, 'Yes (1)', 'course cohort count correct');
    assert.strictEqual(pubcheck.terms, 'No', 'course terms count correct');
    assert.strictEqual(pubcheck.objectives, 'No', 'course objectives count correct');

    // assert.notOk(pubcheck.publishMissingRequirements);
    // assert.notOk(pubcheck.publish);

    assert.ok(pubcheck.publishWithMissingItems, 'publish with missing items button visible');
    assert.strictEqual(
      pubcheck.publishWithMissingItems.text,
      'Publish Course, with 2 items missing',
      'publish course button text correct',
    );

    await pubcheck.publishWithMissingItems.click();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
  });

  test('check publish draft course, all items set', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
      terms: [this.term],
      courseObjectives: [this.courseObjective],
    });
    await page.visit({ courseId: course.id });

    assert.strictEqual(currentURL(), '/courses/1', 'course page url is correct');
    assert.strictEqual(
      page.details.header.publicationMenu.toggle.text,
      'Not Published',
      'course published status is correct',
    );
    assert.ok(page.details.hasCollapseControl, 'course has collapse control');

    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );
    assert.notOk(page.details.hasCollapseControl, 'course does not have collapse control anymore');

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(
      pubcheck.title,
      'Publication Review',
      'course publication review title correct',
    );
    assert.strictEqual(
      pubcheck.missingItemsTitle,
      'Missing Items (0)',
      'course missing items correct',
    );
    assert.strictEqual(pubcheck.courseTitle, 'course 0', 'course title correct');
    assert.strictEqual(pubcheck.cohorts, 'Yes (1)', 'course cohort count correct');
    assert.strictEqual(pubcheck.terms, 'Yes (1)', 'course terms count correct');
    assert.strictEqual(pubcheck.objectives, 'Yes (1)', 'course objectives count correct');

    // assert.notOk(pubcheck.publishMissingRequirements);
    // assert.notOk(pubcheck.publishWithMissingItems);

    assert.ok(pubcheck.publish);
    assert.strictEqual(
      pubcheck.publish.text,
      'Publish Course',
      'publish course button text correct',
    );

    await pubcheck.publish.click();
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

  test('check publish scheduled course, missing requirements', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [],
      published: true,
      publishedAsTbd: true,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Scheduled');
    assert.ok(page.details.hasCollapseControl);

    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );
    assert.notOk(page.details.hasCollapseControl);

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (3)');
    assert.strictEqual(pubcheck.courseTitle, 'course 0');
    assert.strictEqual(pubcheck.cohorts, 'No');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');

    assert.ok(pubcheck.publishMissingRequirements, 'publish missing requirements button visible');
    assert.ok(pubcheck.publishMissingRequirements.isDisabled, 'publish course button disabled');
    assert.strictEqual(
      pubcheck.publishMissingRequirements.text,
      'Publish Course',
      'publish course button text correct',
    );
  });

  test('check publish scheduled course, missing items', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
      published: true,
      publishedAsTbd: true,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Scheduled');
    assert.ok(page.details.hasCollapseControl);

    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );
    assert.notOk(page.details.hasCollapseControl);

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (2)');
    assert.strictEqual(pubcheck.courseTitle, 'course 0');
    assert.strictEqual(pubcheck.cohorts, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'No');
    assert.strictEqual(pubcheck.objectives, 'No');
    assert.strictEqual(
      pubcheck.publishWithMissingItems.text,
      'Publish Course, with 2 items missing',
    );

    await pubcheck.publishWithMissingItems.click();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
  });

  test('check publish scheduled course, all items set', async function (assert) {
    const course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
      terms: [this.term],
      courseObjectives: [this.courseObjective],
      published: true,
      publishedAsTbd: true,
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Scheduled');
    assert.ok(page.details.hasCollapseControl);

    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publish();

    assert.strictEqual(
      currentURL(),
      '/courses/1/publicationcheck?details=true&detailsCollapseControl=false',
      'course publicationcheck url is correct',
    );
    assert.notOk(page.details.hasCollapseControl);

    const pubcheck = pubcheckPage.publicationcheck;

    assert.strictEqual(pubcheck.title, 'Publication Review');
    assert.strictEqual(pubcheck.missingItemsTitle, 'Missing Items (0)');
    assert.strictEqual(pubcheck.courseTitle, 'course 0');
    assert.strictEqual(pubcheck.cohorts, 'Yes (1)');
    assert.strictEqual(pubcheck.terms, 'Yes (1)');
    assert.strictEqual(pubcheck.objectives, 'Yes (1)');
    assert.strictEqual(pubcheck.publish.text, 'Publish Course');

    await pubcheck.publish.click();
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
