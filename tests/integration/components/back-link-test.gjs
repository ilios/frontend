import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/back-link';
import BackLink from 'frontend/components/back-link';

module('Integration | Component | back link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><BackLink /></template>);
    assert.strictEqual(component.text, 'Back');
  });
});
