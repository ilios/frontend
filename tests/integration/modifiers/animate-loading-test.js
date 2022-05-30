import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitUntil } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | animate-loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`<div {{animate-loading}}></div>`);

    assert.ok(true);
    assert.dom('div').hasClass('animate-loading');
    await waitUntil(() => !this.element.querySelector('div').classList.contains('animate-loading'));
    assert.dom('div').doesNotHaveClass('animate-loading');
  });
});
