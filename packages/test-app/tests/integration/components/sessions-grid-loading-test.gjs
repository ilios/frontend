import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import SessionsGridLoading from 'ilios-common/components/sessions-grid-loading';

module('Integration | Component | sessions-grid-loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><SessionsGridLoading @count={{5}} /></template>);

    assert.dom('[data-test-row]').exists({ count: 5 });
  });
});
