import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';

module('Acceptance | Application layout', function (hooks) {
  setupApplicationTest(hooks);

  test('layout with LTI-scoped authentication token', async function (assert) {
    await setupAuthentication({}, true, { application_scope: 'lti-dashboard' });
    await visit('/');
    assert.dom('.application-wrapper').doesNotHaveClass('show-navigation');
    assert.dom('header.ilios-header').doesNotExist();
    assert.dom('.ilios-logo').doesNotExist();
    assert.dom('[data-test-ilios-navigation]').doesNotExist();
    assert.dom('#main').exists();
    assert.dom('footer.ilios-footer').doesNotExist();
    await takeScreenshot(assert);
  });

  test('layout with non LTI-scoped authentication token', async function (assert) {
    await setupAuthentication({}, true);
    await visit('/');
    assert.dom('.application-wrapper').hasClass('show-navigation');
    assert.dom('header.ilios-header').exists();
    assert.dom('.ilios-logo').exists();
    assert.dom('[data-test-ilios-navigation]').exists();
    assert.dom('#main').exists();
    assert.dom('footer.ilios-footer').exists();
    await takeScreenshot(assert);
  });
});
