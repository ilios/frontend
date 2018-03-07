import destroyApp from '../../../helpers/destroy-app';
import moment from 'moment';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};

module('Acceptance: Session - Publish', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('course');
    server.create('sessionType');
    server.create('ilmSession', {
      dueDate: moment().format()
    });
    fixtures.publishedSession = server.create('session', {
      published: true,
      courseId: 1,
    });
    fixtures.scheduledSession = server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: true,
    });
    fixtures.draftSession = server.create('session', {
      courseId: 1,
    });
    fixtures.ilmSession = server.create('session', {
      courseId: 1,
      ilmSessionId: 1
    });
    server.create('offering', {
      sessionId: 1,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format()
    });
    server.create('offering', {
      sessionId: 2,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format()
    });
    server.create('offering', {
      sessionId: 3,
      startDate: moment().format(),
      endDate: moment().add('6 hours').format()
    });
  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('check published session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.publishedSession.id);

    assert.equal(currentPath(), 'course.session.index');
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Published'));
    //we have to click the button to create the options
    await click(selector);

    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Review 3 Missing Items', 'Mark as Scheduled', 'UnPublish Session'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });

  test('check scheduled session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.scheduledSession.id);

    assert.equal(currentPath(), 'course.session.index');
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Scheduled'));
    //we have to click the button to create the options
    await click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'UnPublish Session'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });

  test('check draft session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.draftSession.id);

    assert.equal(currentPath(), 'course.session.index');
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    assert.equal(getElementText(selector), getText('Not Published'));
    //we have to click the button to create the options
    await click(selector);
    let items = find(choices);
    assert.equal(items.length, 3);
    let expectedItems = ['Publish As-is', 'Review 3 Missing Items', 'Mark as Scheduled'];
    for(let i = 0; i < items.length; i++){
      assert.equal(getElementText(items.eq(i)), getText(expectedItems[i]));
    }
  });

  test('check publish draft session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.draftSession.id);
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:eq(0)`;
    await click(selector);
    await click(publish);

    assert.equal(getElementText(selector), getText('Published'));
  });

  test('check schedule draft session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.draftSession.id);
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:eq(2)`;
    await click(selector);
    await click(schedule);

    assert.equal(getElementText(selector), getText('Scheduled'));
  });

  test('check publish scheduled session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.scheduledSession.id);
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const publish = `${choices}:eq(0)`;
    await click(selector);
    await click(publish);

    assert.equal(getElementText(selector), getText('Published'));
  });

  test('check unpublish scheduled session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.scheduledSession.id);
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:eq(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(getElementText(selector), getText('Not Published'));
  });

  test('check schedule published session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.publishedSession.id);
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const schedule = `${choices}:eq(1)`;
    await click(selector);
    await click(schedule);

    assert.equal(getElementText(selector), getText('Scheduled'));
  });

  test('check unpublish published session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.publishedSession.id);
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const unPublish = `${choices}:eq(2)`;
    await click(selector);
    await click(unPublish);

    assert.equal(getElementText(selector), getText('Not Published'));
  });

  test('check publish requirements for ilm session', async function(assert) {
    await visit('/courses/1/sessions/' + fixtures.ilmSession.id);
    const menu = '.publish-menu:eq(1)';
    const selector = `${menu} .rl-dropdown-toggle`;
    const choices = `${menu} .rl-dropdown button`;
    const firstChoice = `${choices}:eq(0)`;
    const secondChoice = `${choices}:eq(1)`;
    await click(selector);

    assert.equal(getElementText(firstChoice), getText('Publish As-is'));
    assert.equal(getElementText(secondChoice), getText('Review 3 Missing Items'));
  });
});
