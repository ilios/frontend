import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | page-title', function (hooks) {
  setupRenderingTest(hooks);

  test('page title does nothing', async function (assert) {
    await render(hbs`{{page-title 'Jayden Rules!'}}`);
    assert.dom().hasText('');
  });
});
