import { render } from '@ember/test-helpers';
import OfferingUrlDisplay from 'frontend/components/offering-url-display';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Component | offering-url-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders URL', async function (assert) {
    await render(<template><OfferingUrlDisplay @url="https://example.edu" /></template>);

    assert.dom(this.element).hasText('Virtual Session Link');
    assert.dom('a').hasAttribute('href', 'https://example.edu');
    assert.dom('a').hasAttribute('title', 'https://example.edu');
    assert.dom('button').hasAttribute('title', 'Copy link');
  });

  test('it renders nothing when no URL sent', async function (assert) {
    await render(<template><OfferingUrlDisplay /></template>);

    assert.dom(this.element).hasText('');
  });
});
