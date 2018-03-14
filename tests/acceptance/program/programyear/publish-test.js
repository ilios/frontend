import { click, currentRouteName, findAll, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

module('Acceptance: Program Year - Publish', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    this.server.create('program', { school });
    this.published = this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', { programYearId: 1 });
    this.scheduled = this.server.create('programYear', {
      programId: 1,
      publishedAsTbd: true
    });
    this.server.create('cohort', { programYearId: 2 });
    this.draft = this.server.create('programYear', {
      programId: 1,
      published: false,
      publishedAsTbd: false
    });
    this.server.create('cohort', { programYearId: 3 });
  });

  test('check published program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.published.id);

    assert.equal(currentRouteName(), 'programYear.index');
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Published'));
    //we have to click the button to create the options
    await click(selector);
    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Review 4 Missing Items', 'Mark as Scheduled', 'UnPublish Program Year'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check scheduled program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.scheduled.id);

    assert.equal(currentRouteName(), 'programYear.index');
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Scheduled'));
    //we have to click the button to create the options
    await click(selector);
    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'UnPublish Program Year'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check draft program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.draft.id);

    assert.equal(currentRouteName(), 'programYear.index');
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(await getElementText(selector), getText('Not Published'));
    //we have to click the button to create the options
    await click(selector);
    let items = findAll(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'Mark as Scheduled'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check publish draft program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.draft.id);
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(publish);

    assert.equal(await getElementText(selector), getText('Published'));
  });

  test('check schedule draft program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.draft.id);
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:nth-of-type(2)`;
    await click(selector);
    await click(schedule);

    assert.equal(await getElementText(selector), getText('Scheduled'));
  });

  test('check publish scheduled program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.scheduled.id);
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(publish);

    assert.equal(await getElementText(selector), getText('Published'));
  });

  test('check unpublish scheduled program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.scheduled.id);
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:nth-of-type(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(await getElementText(selector), getText('Not Published'));
  });

  test('check schedule published program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.published.id);
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown > button`;
    const schedule = `${choices}:nth-of-type(1)`;
    await click(selector);
    await click(schedule);

    assert.equal(await getElementText(selector), getText('Scheduled'));
    let items = findAll(choices);
    assert.equal(items.length, 2);
    let expectedItems = ['Publish As-is', 'UnPublish Program Year'];
    for(let i = 0; i < items.length; i++){
      assert.equal(await getElementText(items[i]), getText(expectedItems[i]));
    }
  });

  test('check unpublish published program year', async function(assert) {
    await visit('/programs/1/programyears/' + this.published.id);
    const menu = '.programyear-publication .publish-menu';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:nth-of-type(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(await getElementText(selector), getText('Not Published'));
  });
});
