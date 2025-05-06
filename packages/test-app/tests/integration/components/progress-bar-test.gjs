import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, find } from '@ember/test-helpers';
import ProgressBar from 'ilios-common/components/progress-bar';

module('Integration | Component | progress bar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders at default 0%', async function (assert) {
    await render(<template><ProgressBar /></template>);

    assert.dom(this.element).hasText('0%');
  });

  test('changing percentage changes width', async function (assert) {
    this.set('passedValue', 42);

    await render(<template><ProgressBar @percentage={{this.passedValue}} /></template>);

    assert.strictEqual(find('.meter').getAttribute('style').trim(), 'width: 42%');

    this.set('passedValue', 12);
    assert.strictEqual(find('.meter').getAttribute('style').trim(), 'width: 12%');
  });

  test('changing percentage changes the displayvalue', async function (assert) {
    this.set('passedValue', 42);

    await render(<template><ProgressBar @percentage={{this.passedValue}} /></template>);

    assert.dom(this.element).hasText('42%');

    this.set('passedValue', 11);
    assert.dom(this.element).hasText('11%');
  });
});
