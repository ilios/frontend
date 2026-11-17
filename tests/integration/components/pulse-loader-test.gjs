import { render } from '@ember/test-helpers';
import PulseLoader from 'frontend/components/pulse-loader';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Component | pulse loader', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><PulseLoader /></template>);
    assert.dom(this.element).hasText('');
  });
});
