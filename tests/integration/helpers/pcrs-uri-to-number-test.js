import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | pcrs-uri-to-number', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', 'aamc-pcrs-comp-c0103');
    await render(hbs`{{pcrs-uri-to-number inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '1.3');
  });
});
