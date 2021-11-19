import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | pcrs-uri-to-number', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.set('inputValue', 'aamc-pcrs-comp-c0103');
    await render(hbs`{{pcrs-uri-to-number inputValue}}`);
    assert.strictEqual(this.element.textContent.trim(), '1.3');
  });
});
