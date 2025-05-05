import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render, click } from '@ember/test-helpers';
import ErrorDisplay from 'frontend/components/error-display';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | error display', function (hooks) {
  setupRenderingTest(hooks);

  test('the detail link toggles properly', async function (assert) {
    assert.expect(3);

    const errors = [
      {
        message: 'this is an error',
      },
    ];

    this.set('errors', errors);
    await render(
      <template><ErrorDisplay @errors={{this.errors}} @clearErrors={{(noop)}} /></template>,
    );

    assert.dom('.error-detail-action').hasText('Hide Details');
    assert.dom('.timestamp').includesText(new Intl.DateTimeFormat('en-US').format(new Date()));

    await click('.error-detail-action');

    assert.dom('.error-detail-action').hasText('Show Details');
  });

  test('404 error works', async function (assert) {
    assert.expect(1);

    const errors = [
      {
        statusCode: '404',
      },
    ];

    this.set('errors', errors);
    await render(
      <template><ErrorDisplay @errors={{this.errors}} @clearErrors={{(noop)}} /></template>,
    );

    assert.dom('.error-main').includesText('Rats!');
  });

  test('clicking clear button fires action', async function (assert) {
    assert.expect(1);

    const errors = [
      {
        message: 'this is an error',
      },
    ];

    this.set('errors', errors);
    this.set('clearErrors', () => {
      assert.ok(true, 'action was fired');
    });
    await render(
      <template>
        <ErrorDisplay @errors={{this.errors}} @clearErrors={{this.clearErrors}} />
      </template>,
    );
    await click('.clear-errors button');
  });
});
