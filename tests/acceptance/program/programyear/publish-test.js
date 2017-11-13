import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: Program Year - Publish', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('program', {
      schoolId: 1
    });
    fixtures.published = server.create('programYear', {
      programId: 1,
    });
    server.create('cohort', { programYearId: 1 });
    fixtures.scheduled = server.create('programYear', {
      programId: 1,
      publishedAsTbd: true
    });
    server.create('cohort', { programYearId: 2 });
    fixtures.draft = server.create('programYear', {
      programId: 1,
      published: false,
      publishedAsTbd: false
    });
    server.create('cohort', { programYearId: 3 });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check published program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.published.id);

  assert.equal(currentPath(), 'program.programYear.index');
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  assert.equal(getElementText(selector), getText('Published'));
  //we have to click the button to create the options
  await click(selector);
  let items = find(choices);
  assert.equal(items.length, 3);
  let expectedItems = ['Review 4 Missing Items', 'Mark as Scheduled', 'UnPublish Program Year'];
  for(let i = 0; i < items.length; i++){
    assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
  }
});

test('check scheduled program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.scheduled.id);

  assert.equal(currentPath(), 'program.programYear.index');
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  assert.equal(getElementText(selector), getText('Scheduled'));
  //we have to click the button to create the options
  await click(selector);
  let items = find(choices);
  assert.equal(items.length, 3);
  let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'UnPublish Program Year'];
  for(let i = 0; i < items.length; i++){
    assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
  }
});

test('check draft program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.draft.id);

  assert.equal(currentPath(), 'program.programYear.index');
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  assert.equal(getElementText(selector), getText('Not Published'));
  //we have to click the button to create the options
  await click(selector);
  let items = find(choices);
  assert.equal(items.length, 3);
  let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'Mark as Scheduled'];
  for(let i = 0; i < items.length; i++){
    assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
  }
});

test('check publish draft program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.draft.id);
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  const publish = `${choices}:eq(0)`;
  await click(selector);
  await click(publish);

  assert.equal(getElementText(selector), getText('Published'));
});

test('check schedule draft program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.draft.id);
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  const schedule = `${choices}:eq(2)`;
  await click(selector);
  await click(schedule);

  assert.equal(getElementText(selector), getText('Scheduled'));
});

test('check publish scheduled program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.scheduled.id);
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  const publish = `${choices}:eq(0)`;
  await click(selector);
  await click(publish);

  assert.equal(getElementText(selector), getText('Published'));
});

test('check unpublish scheduled program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.scheduled.id);
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  const unPublish = `${choices}:eq(2)`;
  await click(selector);
  await click(unPublish);

  assert.equal(getElementText(selector), getText('Not Published'));
});

test('check schedule published program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.published.id);
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  const schedule = `${choices}:eq(1)`;
  await click(selector);
  await click(schedule);

  assert.equal(getElementText(selector), getText('Scheduled'));
  let items = find(choices);
  assert.equal(items.length, 3);
  let expectedItems = ['Publish As-is', 'Review 4 Missing Items', 'UnPublish Program Year'];
  for(let i = 0; i < items.length; i++){
    assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
  }
});

test('check unpublish published program year', async function(assert) {
  await visit('/programs/1/programyears/' + fixtures.published.id);
  const menu = '.publish-menu:eq(1)';
  const selector = `${menu} .rl-dropdown-toggle`;
  const choices = `${menu} .rl-dropdown button`;
  const unPublish = `${choices}:eq(2)`;
  await click(selector);
  await click(unPublish);

  assert.equal(getElementText(selector), getText('Not Published'));
});
