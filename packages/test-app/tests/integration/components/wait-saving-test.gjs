import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { fillIn, render, waitFor, settled, find } from '@ember/test-helpers';
import WaitSaving from 'ilios-common/components/wait-saving';

module('Integration | Component | wait saving', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><WaitSaving /></template>);

    assert.dom(this.element).hasText('saving... one moment...');
  });

  test('it renders progress bar', async function (assert) {
    this.set('currentProgress', 25);
    await render(
      <template>
        <WaitSaving
          @showProgress={{true}}
          @totalProgress={{100}}
          @currentProgress={{this.currentProgress}}
        />
      </template>,
    );
    assert.strictEqual(find('.meter').getAttribute('style'), 'width: 25%');
    this.set('currentProgress', 42);
    assert.strictEqual(find('.meter').getAttribute('style'), 'width: 42%');
  });

  test('it in block form', async function (assert) {
    this.set('content', 'template block text');
    await render(
      <template>
        <WaitSaving>
          {{this.content}}
        </WaitSaving>
      </template>,
    );

    assert.dom(this.element).hasText('template block text');
  });

  test('it traps focus and returns it', async function (assert) {
    this.set('label', 'lorem ipsum');
    await render(
      <template>
        {{#if this.show}}
          <WaitSaving />
        {{/if}}
        <label>
          <input type="text" />
          {{this.label}}
        </label>
      </template>,
    );
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
