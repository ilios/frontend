import { click, currentRouteName, visit, findAll } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Course - Publish', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.user = await setupAuthentication();
    this.school = this.server.create('school');
    this.server.create('cohort');
  });

  test('check published course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      cohortIds: [1],
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      cohortIds: [1],
    });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
    });
    await visit('/courses/1');

    assert.equal(currentRouteName(), 'course.index');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Published'));
    //we have to click the button to create the options
    await click(selector);
    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Review 3 Missing Items', 'Mark as Scheduled', 'UnPublish Course'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check scheduled course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      cohortIds: [1],
    });
    await visit('/courses/1');

    assert.equal(currentRouteName(), 'course.index');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Scheduled'));
    //we have to click the button to create the options
    await click(selector);
    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'UnPublish Course'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check draft course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
    });
    await visit('/courses/1');

    assert.equal(currentRouteName(), 'course.index');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Not Published'));
    //we have to click the button to create the options
    await click(selector);
    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'Mark as Scheduled'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check publish draft course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
    });
    await visit('/courses/1');

    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    await click(selector);
    await click(findAll(choices)[0]);

    assert.equal(await getElementText(selector), getText('Published'));
  });

  test('check schedule draft course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    await click(selector);
    await click(findAll(choices)[2]);

    assert.equal(await getElementText(selector), getText('Scheduled'));
  });

  test('check publish scheduled course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    await click(selector);
    await click(findAll(choices)[0]);

    assert.equal(await getElementText(selector), getText('Published'));
  });

  test('check unpublish scheduled course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      publishedAsTbd: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    await click(selector);
    await click(findAll(choices)[2]);

    assert.equal(await getElementText(selector), getText('Not Published'));
  });

  test('check schedule published course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    await click(selector);
    await click(findAll(choices)[1]);

    assert.equal(await getElementText(selector), getText('Scheduled'));
  });

  test('check unpublish published course', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      cohortIds: [1],
    });
    await visit('/courses/1');
    const menu = '[data-test-course-header] .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    await click(selector);
    await click(findAll(choices)[2]);

    assert.equal(await getElementText(selector), getText('Not Published'));
  });
});
