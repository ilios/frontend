import { click, visit, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication, getElementText, getText } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Course - Publish', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('cohort');
  });

  test('check publish draft course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
    });
    await visit('/courses/1');

    const menu = '[data-test-course-header] .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    await click(selector);
    await click(findAll(choices)[0]);

    assert.strictEqual(await getElementText(selector), getText('Published'));
  });

  test('check schedule draft course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    await click(selector);
    await click(findAll(choices)[2]);

    assert.strictEqual(await getElementText(selector), getText('Scheduled'));
  });

  test('check publish scheduled course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    await click(selector);
    await click(findAll(choices)[0]);

    assert.strictEqual(await getElementText(selector), getText('Published'));
  });

  test('check unpublish scheduled course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    await click(selector);
    await click(findAll(choices)[2]);

    assert.strictEqual(await getElementText(selector), getText('Not Published'));
  });

  test('check schedule published course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    await click(selector);
    await click(findAll(choices)[1]);

    assert.strictEqual(await getElementText(selector), getText('Scheduled'));
  });

  test('check unpublish published course', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    await click(selector);
    await click(findAll(choices)[2]);

    assert.strictEqual(await getElementText(selector), getText('Not Published'));
  });
});
