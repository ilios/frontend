import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | page-title', function (hooks) {
  setupRenderingTest(hooks);

  test('page title does nothing', async function (assert) {
    this.set('title', 'Jayden Rules!');
    await render(hbs`{{page-title this.title}}`);
    assert.dom().hasText('');
  });
});
