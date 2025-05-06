import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import SessionsGridOffering from 'ilios-common/components/sessions-grid-offering';

module('Integration | Component | sessions-grid-offering', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const offering = {};
    this.set('offering', offering);
    await render(<template><SessionsGridOffering @offering={{this.offering}} /></template>);

    assert.dom(this.element).hasText('');
  });
});
