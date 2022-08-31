import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'dummy/tests/helpers';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Publish', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.cohort = this.server.create('cohort');
  });

  test('check publish draft course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Not Published');
    await page.details.header.publicationMenu.toggle.click();
    await page.details.header.publicationMenu.publishAsIs();
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
  });

  test('check schedule draft course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
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
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
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
    assert.strictEqual(page.details.header.publicationMenu.toggle.text, 'Published');
  });

  test('check unpublish scheduled course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
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
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
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
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
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
