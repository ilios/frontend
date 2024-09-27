import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { fillIn, render, waitFor, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | wait saving', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<WaitSaving />`);

    assert.dom(this.element).hasText('saving... one moment...');
  });

  test('it in block form', async function (assert) {
    this.set('content', 'template block text');
    await render(hbs`<WaitSaving>
  {{this.content}}
</WaitSaving>`);

    assert.dom(this.element).hasText('template block text');
  });

  test('it traps focus and returns it', async function (assert) {
    this.set('label', 'lorem ipsum');
    await render(hbs`{{#if this.show}}
  <WaitSaving />
{{/if}}
<label>
  <input type='text' />
  {{this.label}}
</label>`);
    await fillIn('input', 'text');
    assert.dom('input').isFocused();
    this.set('show', true);
    await waitFor('[data-test-wait-saving]');
    assert.dom('input').isNotFocused();
    assert.dom('[data-test-wait-saving] [data-test-content]').isFocused();
    this.set('show', false);
    await settled();
    assert.dom('input').isFocused();
  });
});
