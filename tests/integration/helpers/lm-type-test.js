import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Helper | lm-type', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('link', async function (assert) {
    assert.expect(1);
    const lm = { link: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type this.lm}}
`);
    assert.dom(this.element).hasText('link');
  });

  test('citation', async function (assert) {
    assert.expect(1);
    const lm = { citation: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type this.lm}}
`);
    assert.dom(this.element).hasText('citation');
  });

  test('file', async function (assert) {
    assert.expect(1);
    const lm = { filename: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type this.lm}}
`);
    assert.dom(this.element).hasText('file');
  });
});
