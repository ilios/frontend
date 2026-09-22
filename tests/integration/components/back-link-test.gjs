import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/back-link';
import BackLink from 'ilios-common/components/back-link';

module('Integration | Component | back link', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><BackLink /></template>);
    assert.strictEqual(component.text, 'Back');
  });
});
