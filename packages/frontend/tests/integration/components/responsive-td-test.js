import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | responsive-td', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders as is accessible', async function (assert) {
    await render(hbs`<ResponsiveTd @largeScreenSpan={{3}} @smallScreenSpan={{2}} />`);

    assert.dom().hasText('');
    assert.dom('td:nth-of-type(1)').hasAttribute('colspan', '3');
    assert.dom('td:nth-of-type(1)').hasClass('hide-from-small-screen');
    assert.dom('td:nth-of-type(2)').hasAttribute('colspan', '2');
    assert.dom('td:nth-of-type(2)').hasClass('hide-from-large-screen');

    this.set('text', 'template block text');
    await render(hbs`<ResponsiveTd class='test'>{{this.text}}</ResponsiveTd>`);

    assert.dom('td:nth-of-type(1)').hasText('template block text');
    assert.dom('td:nth-of-type(1)').hasClass('test');
    assert.dom('td:nth-of-type(2)').hasText('template block text');
    assert.dom('td:nth-of-type(2)').hasClass('test');

    assert.dom().hasText('template block text template block text');
  });
});
