import { click, currentRouteName, findAll, visit } from '@ember/test-helpers';
import moment from 'moment';
import { module, test } from 'qunit';
import { setupAuthentication, getElementText, getText } from 'ilios-common';

import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Session - Publish', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school, administeredSchools: [school] });
    const course = this.server.create('course', { school });
    this.server.create('sessionType');
    this.server.create('ilmSession', {
      dueDate: moment().format(),
    });
    this.publishedSession = this.server.create('session', {
      published: true,
      course,
    });
    this.scheduledSession = this.server.create('session', {
      course,
      published: true,
      publishedAsTbd: true,
    });
    this.draftSession = this.server.create('session', {
      course,
    });
    this.ilmSession = this.server.create('session', {
      course,
      ilmSessionId: 1,
    });
    this.server.create('offering', {
      sessionId: 1,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format(),
    });
    this.server.create('offering', {
      sessionId: 2,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format(),
    });
    this.server.create('offering', {
      sessionId: 3,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format(),
    });
  });

  test('check published session', async function (assert) {
    assert.expect(6);
    await visit('/courses/1/sessions/' + this.publishedSession.id);

    assert.strictEqual(currentRouteName(), 'session.index');
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    assert.strictEqual(await getElementText(selector), getText('Published'));
    //we have to click the button to create the options
    await click(selector);

    const items = findAll(choices);
    assert.strictEqual(items.length, 3);
    const expectedItems = ['Review 3 Missing Items', 'Mark as Scheduled', 'UnPublish Session'];
    for (let i = 0; i < items.length; i++) {
      assert.strictEqual(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check scheduled session', async function (assert) {
    assert.expect(6);
    await visit('/courses/1/sessions/' + this.scheduledSession.id);

    assert.strictEqual(currentRouteName(), 'session.index');
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    assert.strictEqual(await getElementText(selector), getText('Scheduled'));
    //we have to click the button to create the options
    await click(selector);
    const items = findAll(choices);
    assert.strictEqual(items.length, 3);
    const expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'UnPublish Session'];
    for (let i = 0; i < items.length; i++) {
      assert.strictEqual(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check draft session', async function (assert) {
    assert.expect(6);
    await visit('/courses/1/sessions/' + this.draftSession.id);

    assert.strictEqual(currentRouteName(), 'session.index');
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    assert.strictEqual(await getElementText(selector), getText('Not Published'));
    //we have to click the button to create the options
    await click(selector);
    const items = findAll(choices);
    assert.strictEqual(items.length, 3);
    const expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'Mark as Scheduled'];
    for (let i = 0; i < items.length; i++) {
      assert.strictEqual(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check publish draft session', async function (assert) {
    await visit('/courses/1/sessions/' + this.draftSession.id);
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    const publish = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(publish);

    assert.strictEqual(await getElementText(selector), getText('Published'));
  });

  test('check schedule draft session', async function (assert) {
    await visit('/courses/1/sessions/' + this.draftSession.id);
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    const schedule = `${choices}:nth-of-type(3)`;
    await click(selector);
    await click(schedule);
    assert.strictEqual(await getElementText(selector), getText('Scheduled'));
  });

  test('check publish scheduled session', async function (assert) {
    await visit('/courses/1/sessions/' + this.scheduledSession.id);
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    const publish = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(publish);

    assert.strictEqual(await getElementText(selector), getText('Published'));
  });

  test('check unpublish scheduled session', async function (assert) {
    await visit('/courses/1/sessions/' + this.scheduledSession.id);
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    const unPublish = `${choices}:nth-of-type(3)`;
    await click(selector);
    await click(unPublish);
    assert.strictEqual(await getElementText(selector), getText('Not Published'));
  });

  test('check schedule published session', async function (assert) {
    await visit('/courses/1/sessions/' + this.publishedSession.id);
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] > button`;
    const schedule = `${choices}:nth-of-type(2)`;
    await click(selector);
    await click(schedule);
    assert.strictEqual(await getElementText(selector), getText('Scheduled'));
  });

  test('check unpublish published session', async function (assert) {
    await visit('/courses/1/sessions/' + this.publishedSession.id);
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] button`;
    const unPublish = `${choices}:nth-of-type(3)`;
    await click(selector);
    await click(unPublish);
    assert.strictEqual(await getElementText(selector), getText('Not Published'));
  });

  test('check publish requirements for ilm session', async function (assert) {
    await visit('/courses/1/sessions/' + this.ilmSession.id);
    const menu = '.session-header .publication-menu';
    const selector = `${menu} [data-test-toggle]`;
    const choices = `${menu} [data-test-menu] > button`;
    const firstChoice = `${choices}:nth-of-type(1)`;
    const secondChoice = `${choices}:nth-of-type(2)`;
    const thirdChoice = `${choices}:nth-of-type(3)`;
    await click(selector);
    assert.strictEqual(await getElementText(firstChoice), getText('Publish As-is'));
    assert.strictEqual(await getElementText(secondChoice), getText('Review 3 Missing Items'));
    assert.strictEqual(await getElementText(thirdChoice), getText('Mark as Scheduled'));
  });
});
