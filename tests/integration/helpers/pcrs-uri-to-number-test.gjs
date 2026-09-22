import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import pcrsUriToNumber from 'frontend/helpers/pcrs-uri-to-number';

module('Integration | Helper | pcrs-uri-to-number', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', 'aamc-pcrs-comp-c0103');
    await render(<template>{{pcrsUriToNumber this.inputValue}}</template>);
    assert.strictEqual(this.element.textContent.trim(), '1.3');
  });
});
