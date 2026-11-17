import { render } from '@ember/test-helpers';
import LinkToWithAction from 'frontend/components/link-to-with-action';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { component } from 'frontend/tests/pages/components/link-to-with-action';
import { module, test } from 'qunit';

module('Integration | Component | link-to-with-action', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('content', 'Link Text');
    await render(
      <template>
        <LinkToWithAction @route="dashboard">
          {{this.content}}
        </LinkToWithAction>
      </template>,
    );

    assert.strictEqual(component.text, 'Link Text');
    assert.strictEqual(component.url, '/dashboard');
    assert.notOk(component.isActive);
  });
});
