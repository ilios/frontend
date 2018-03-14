import { click, currentRouteName, findAll, visit } from '@ember/test-helpers';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: Session - Publish', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    await setupAuthentication();
    this.server.create('school');
    this.server.create('course');
    this.server.create('sessionType');
    this.server.create('ilmSession', {
      dueDate: moment().format()
    });
    this.publishedSession = this.server.create('session', {
      published: true,
      courseId: 1,
    });
    this.scheduledSession = this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: true,
    });
    this.draftSession = this.server.create('session', {
      courseId: 1,
    });
    this.ilmSession = this.server.create('session', {
      courseId: 1,
      ilmSessionId: 1
    });
    this.server.create('offering', {
      sessionId: 1,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format()
    });
    this.server.create('offering', {
      sessionId: 2,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format()
    });
    this.server.create('offering', {
      sessionId: 3,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format()
    });
  });

  test('check published session', async function(assert) {
    await visit('/courses/1/sessions/' + this.publishedSession.id);

    assert.equal(currentRouteName(), 'session.index');
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Published'));
    //we have to click the button to create the options
    await click(selector);

    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Review 3 Missing Items', 'Mark as Scheduled', 'UnPublish Session'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check scheduled session', async function(assert) {
    await visit('/courses/1/sessions/' + this.scheduledSession.id);

    assert.equal(currentRouteName(), 'session.index');
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Scheduled'));
    //we have to click the button to create the options
    await click(selector);
    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'UnPublish Session'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check draft session', async function(assert) {
    await visit('/courses/1/sessions/' + this.draftSession.id);

    assert.equal(currentRouteName(), 'session.index');
    const menu = '.session-header .publish-menu';
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

  test('check publish draft session', async function(assert) {
    await visit('/courses/1/sessions/' + this.draftSession.id);
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(publish);

    assert.equal(await getElementText(selector), getText('Published'));
  });

  test('check schedule draft session', async function(assert) {
    await visit('/courses/1/sessions/' + this.draftSession.id);
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:nth-of-type(2)`;
    await click(selector);
    await click(schedule);

    assert.equal(await getElementText(selector), getText('Scheduled'));
  });

  test('check publish scheduled session', async function(assert) {
    await visit('/courses/1/sessions/' + this.scheduledSession.id);
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(publish);

    assert.equal(await getElementText(selector), getText('Published'));
  });

  test('check unpublish scheduled session', async function(assert) {
    await visit('/courses/1/sessions/' + this.scheduledSession.id);
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:nth-of-type(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(await getElementText(selector), getText('Not Published'));
  });

  test('check schedule published session', async function(assert) {
    await visit('/courses/1/sessions/' + this.publishedSession.id);
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown > button`;
    const schedule = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(schedule);

    assert.equal(await getElementText(selector), getText('Scheduled'));
  });

  test('check unpublish published session', async function(assert) {
    await visit('/courses/1/sessions/' + this.publishedSession.id);
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:nth-of-type(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(await getElementText(selector), getText('Not Published'));
  });

  test('check publish requirements for ilm session', async function(assert) {
    await visit('/courses/1/sessions/' + this.ilmSession.id);
    const menu = '.session-header .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown > button`;
    const firstChoice = `${choices}:nth-of-type(1)`;
    const secondChoice = `${menu} a`;
    const thirdChoice = `${choices}:nth-of-type(2)`;
    await click(selector);

    assert.equal(await getElementText(firstChoice), getText('Publish As-is'));
    assert.equal(await getElementText(secondChoice), getText('Review 3 Missing Items'));
    assert.equal(await getElementText(thirdChoice), getText('Mark as Scheduled'));
  });
});
