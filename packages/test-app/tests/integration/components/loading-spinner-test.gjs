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
  });
});
