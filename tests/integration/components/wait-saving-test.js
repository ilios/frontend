import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { fillIn, render, waitFor, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | wait saving', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    assert.expect(1);
    await render(hbs`<WaitSaving />
`);

    assert.dom(this.element).hasText('saving... one moment...');
  });

  test('it in block form', async function (assert) {
    assert.expect(1);
    await render(hbs`
      <WaitSaving>
        template block text
      </WaitSaving>
    
`);

    assert.dom(this.element).hasText('template block text');
  });

  test('it traps focus and returns it', async function (assert) {
    await render(hbs`
      {{#if this.show}}
        <WaitSaving />
      {{/if}}
      <input type="text" />
    
`);
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
