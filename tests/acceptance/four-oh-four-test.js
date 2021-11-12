import { currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | FourOhFour', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication();
  });

  test('visiting /four-oh-four', async function (assert) {
    await visit('/four-oh-four');

    assert.strictEqual(currentRouteName(), 'fourOhFour');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard"
      );
  });

  test('visiting /nothing', async function (assert) {
    await visit('/nothing');
    assert.strictEqual(currentRouteName(), 'fourOhFour');
  });
});
