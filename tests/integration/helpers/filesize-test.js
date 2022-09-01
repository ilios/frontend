import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('helper:filesize', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it bytes', async function (assert) {
    this.set('inputValue', '42');

    await render(hbs`{{filesize this.inputValue}}`);

    assert.dom(this.element).hasText('42b');
  });

  test('it kilobytes', async function (assert) {
    this.set('inputValue', '4200');

    await render(hbs`{{filesize this.inputValue}}`);

    assert.dom(this.element).hasText('4kb');
  });

  test('it megabytes', async function (assert) {
    this.set('inputValue', '4200000');

    await render(hbs`{{filesize this.inputValue}}`);

    assert.dom(this.element).hasText('4mb');
  });
});
