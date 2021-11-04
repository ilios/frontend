import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import page from 'ilios-common/page-objects/course';

module('Acceptance | Course - Publish', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
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
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Not Published');
    await page.header.publicationMenu.toggle.click();
    await page.header.publicationMenu.publishAsIs();
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Published');
  });

  test('check schedule draft course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
      cohorts: [this.cohort],
    });
    await page.visit({ courseId: course.id });
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Not Published');
    await page.header.publicationMenu.toggle.click();
    await page.header.publicationMenu.markAsScheduled();
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Scheduled');
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
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Scheduled');
    await page.header.publicationMenu.toggle.click();
    await page.header.publicationMenu.publishAsIs();
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Published');
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
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Scheduled');
    await page.header.publicationMenu.toggle.click();
    await page.header.publicationMenu.unpublishCourse();
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Not Published');
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
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Published');
    await page.header.publicationMenu.toggle.click();
    await page.header.publicationMenu.markAsScheduled();
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Scheduled');
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
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Published');
    await page.header.publicationMenu.toggle.click();
    await page.header.publicationMenu.unpublishCourse();
    assert.strictEqual(page.header.publicationMenu.toggle.text, 'Not Published');
  });
});
