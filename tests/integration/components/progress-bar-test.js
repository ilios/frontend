import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | progress bar', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders at default 0%', async function (assert) {
    await render(hbs`<ProgressBar />`);

    assert.dom(this.element).hasText('0%');
  });

  test('changing percentage changes width', async function (assert) {
    this.set('passedValue', 42);

    await render(hbs`<ProgressBar @percentage={{this.passedValue}} />`);

    assert.strictEqual(find('.meter').getAttribute('style').trim(), 'width: 42%');

    this.set('passedValue', 12);
    assert.strictEqual(find('.meter').getAttribute('style').trim(), 'width: 12%');
  });

  test('changing percentage changes the displayvalue', async function (assert) {
    this.set('passedValue', 42);

    await render(hbs`<ProgressBar @percentage={{this.passedValue}} />`);

    assert.dom(this.element).hasText('42%');

    this.set('passedValue', 11);
    assert.dom(this.element).hasText('11%');
  });
});
