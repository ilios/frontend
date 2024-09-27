import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | offering-url-display', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders URL', async function (assert) {
    await render(hbs`<OfferingUrlDisplay @url='https://example.edu' />`);

    assert.dom(this.element).hasText('Virtual Session Link');
    assert.dom('a').hasAttribute('href', 'https://example.edu');
    assert.dom('a').hasAttribute('title', 'https://example.edu');
    assert.dom('button').hasAttribute('title', 'Copy link');
  });

  test('it renders nothing when no URL sent', async function (assert) {
    await render(hbs`<OfferingUrlDisplay />`);

    assert.dom(this.element).hasText('');
  });
});
