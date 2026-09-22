import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import ListLoading from 'frontend/components/reports/list-loading';

module('Integration | Component | reports/list-loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><ListLoading @count={{2}} /></template>);

    assert.dom('[data-test-loading-item]').exists({ count: 2 });
  });
});
