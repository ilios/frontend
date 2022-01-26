import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | copy-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(hbs`
      <CopyButton>
        template block text
      </CopyButton>
    `);

    assert.dom(this.element).hasText('template block text');
    assert.dom('button').exists({ count: 1 });
    assert.dom('button').hasClass('copy-btn');
  });
});
