import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import PulseLoader from 'ilios-common/components/pulse-loader';

module('Integration | Component | pulse loader', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><PulseLoader /></template>);
    assert.dom(this.element).hasText('');
  });
});
