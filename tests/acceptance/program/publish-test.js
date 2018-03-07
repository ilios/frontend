import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: Program - Publish', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    fixtures.published = server.create('program', {
      startYear: 2013,
      schoolId: 1,
    });
    fixtures.scheduled = server.create('program', {
      startYear: 2013,
      schoolId: 1,
      publishedAsTbd: true
    });
    fixtures.draft = server.create('program', {
      startYear: 2013,
      schoolId: 1,
      published: false,
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('check published program', async function(assert) {
    await visit('/programs/' + fixtures.published.id);

    assert.equal(currentPath(), 'program.index');
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Published'));
    //we have to click the button to create the options
    await click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Review 1 Missing Items', 'Mark as Scheduled', 'UnPublish Program'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });

  test('check scheduled program', async function(assert) {
    await visit('/programs/' + fixtures.scheduled.id);

    assert.equal(currentPath(), 'program.index');
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Scheduled'));
    //we have to click the button to create the options
    await click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 1 Missing Items', 'UnPublish Program'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });

  test('check draft program', async function(assert) {
    await visit('/programs/' + fixtures.draft.id);

    assert.equal(currentPath(), 'program.index');
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Not Published'));
    //we have to click the button to create the options
    await click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 1 Missing Items', 'Mark as Scheduled'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });

  test('check publish draft program', async function(assert) {
    await visit('/programs/' + fixtures.draft.id);
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:eq(0)`;
    await click(selector);
    await click(publish);

    assert.equal(getElementText(selector), getText('Published'));
  });

  test('check schedule draft program', async function(assert) {
    await visit('/programs/' + fixtures.draft.id);
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:eq(2)`;

    await click(selector);
    await click(schedule);

    assert.equal(getElementText(selector), getText('Scheduled'));
  });

  test('check publish scheduled program', async function(assert) {
    await visit('/programs/' + fixtures.scheduled.id);
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:eq(0)`;
    await click(selector);
    await click(publish);

    assert.equal(getElementText(selector), getText('Published'));
  });

  test('check unpublish scheduled program', async function(assert) {
    await visit('/programs/' + fixtures.scheduled.id);
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:eq(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(getElementText(selector), getText('Not Published'));
  });

  test('check schedule published program', async function(assert) {
    await visit('/programs/' + fixtures.published.id);
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:eq(1)`;
    await click(selector);
    await click(schedule);

    assert.equal(getElementText(selector), getText('Scheduled'));
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 1 Missing Items', 'UnPublish Program'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });

  test('check unpublish published program', async function(assert) {
    await visit('/programs/' + fixtures.published.id);
    const menu = '.publish-menu:eq(0)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:eq(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(getElementText(selector), getText('Not Published'));
  });
});
