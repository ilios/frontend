import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import OfferingUrlDisplay from 'ilios-common/components/offering-url-display';

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
