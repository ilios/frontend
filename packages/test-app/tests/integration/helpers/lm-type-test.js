import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | lm-type', function (hooks) {
  setupRenderingTest(hooks);

  test('link', async function (assert) {
    const lm = { link: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type this.lm}}`);
    assert.dom(this.element).hasText('link');
  });

  test('citation', async function (assert) {
    const lm = { citation: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type this.lm}}`);
    assert.dom(this.element).hasText('citation');
  });

  test('file', async function (assert) {
    const lm = { filename: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type this.lm}}`);
    assert.dom(this.element).hasText('file');
  });
});
