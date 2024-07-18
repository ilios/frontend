import { currentRouteName, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import percySnapshot from '@percy/ember';

module('Acceptance | FourOhFour', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await setupAuthentication();
  });

  test('visiting /four-oh-four', async function (assert) {
    assert.expect(2);
    await visit('/four-oh-four');
    await percySnapshot(assert);

    assert.strictEqual(currentRouteName(), 'four-oh-four');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting /nothing', async function (assert) {
    await visit('/nothing');
    assert.strictEqual(currentRouteName(), 'four-oh-four');
  });

  test('visiting missing course', async function (assert) {
    await visit('/courses/1337');
    assert.strictEqual(currentURL(), '/courses/1337');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting existing course does not trigger', async function (assert) {
    this.school = this.server.create('school');
    this.course = this.server.create('course', { school: this.school });

    await visit('/courses/1');
    assert.strictEqual(currentURL(), '/courses/1');
    assert.dom('.full-screen-error').doesNotExist();
  });

  test('visiting missing report #5127', async function (assert) {
    await visit('/reports/subjects/1989');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });
});
