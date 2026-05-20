import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Acceptance | login', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /login', async function (assert) {
    await visit('/login');
    await takeScreenshot(assert);

    assert.strictEqual(currentURL(), '/login', 'transitions to user route');
    await a11yAudit();
    assert.ok(true, 'no a11y errors found');
  });

  test('form login type shows form', async function (assert) {
    this.server.get('/application/config', function () {
      assert.step('API called');
      return {
        config: {
          type: 'form',
        },
      };
    });

    await visit('/login');
    assert.dom('.login-form').exists();
    assert.verifySteps(['API called']);
  });

  test('invalid login type does not show form and throws error', async function (assert) {
    this.server.get('/application/config', function () {
      assert.step('API called');
      return {
        config: {
          type: 'boofar',
        },
      };
    });

    await visit('/login');
    assert.dom('.login-form').doesNotExist();
    assert
      .dom('.full-screen-error')
      .hasText(
        'Zoinks! Something is very wrong. Please refresh your browser and let us know at support@iliosproject.org if you continue to see this message. Refresh the Browser',
      );
    assert.verifySteps(['API called']);
  });
});
