import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

module('Integration | Component | loading-spinner', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><LoadingSpinner /></template>);

    assert.dom(this.element).hasText('');
    assert.dom('svg').hasClass('fa-spinner');
    assert.dom('svg').hasClass('fa-spin');
  });

  test('it supports custom options', async function (assert) {
    await render(<template><LoadingSpinner @class="orange" @size="2x" /></template>);

    assert.dom(this.element).hasText('');
    assert.dom('svg').hasClass('fa-spinner');
    assert.dom('svg').hasClass('fa-spin');
    assert.dom('svg').hasClass('orange');
    assert.dom('svg').hasClass('fa-2x');
  });
});
