import { module, test } from 'qunit';
import { setupRenderingTest, takeComponentScreenshot } from 'frontend/tests/helpers';
import { render, click } from '@ember/test-helpers';
import ErrorDisplay from 'frontend/components/error-display';
import noop from 'frontend/helpers/noop';

module('Integration | Component | error display', function (hooks) {
  setupRenderingTest(hooks);

  test('renders and is accessible', async function (assert) {
    this.set('error', {
      message: 'this is an error',
      statusCode: 500,
    });
    await render(
      <template><ErrorDisplay @error={{this.error}} @clearError={{(noop)}} /></template>,
    );

    assert.dom('[data-test-main-message]').hasText('Error');
    assert.dom('[data-test-status-code]').hasText('Status Code: 500');
    assert.dom('[data-test-message]').hasText('this is an error');
    await takeComponentScreenshot(assert);
  });

  test('the detail link toggles properly', async function (assert) {
    this.set('error', {
      message: 'this is an error',
    });
    await render(
      <template><ErrorDisplay @error={{this.error}} @clearError={{(noop)}} /></template>,
    );

    assert.dom('.error-detail-action').hasText('Hide Details');
    await click('.error-detail-action');
    assert.dom('.error-detail-action').hasText('Show Details');
    await takeComponentScreenshot(assert);
  });

  test('Renders nice title if we get it', async function (assert) {
    this.set('error', {
      message: 'this is an error',
      errors: [{ title: 'a nice message' }],
    });
    await render(
      <template><ErrorDisplay @error={{this.error}} @clearError={{(noop)}} /></template>,
    );
    assert.dom('[data-test-main-message]').hasText('a nice message');
    assert.dom('[data-test-status-code]').doesNotExist();
    assert.dom('[data-test-message]').hasText('this is an error');
    await takeComponentScreenshot(assert);
  });

  test('clicking clear button fires action', async function (assert) {
    this.set('error', {
      message: 'this is an error',
    });
    this.set('clearError', () => {
      assert.step('clearError called');
    });
    await render(
      <template><ErrorDisplay @error={{this.error}} @clearError={{this.clearError}} /></template>,
    );
    await click('.clear-error button');
    assert.verifySteps(['clearError called']);
  });
});
