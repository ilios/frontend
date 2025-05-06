import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import lmType from 'ilios-common/helpers/lm-type';

module('Integration | Helper | lm-type', function (hooks) {
  setupRenderingTest(hooks);

  test('link', async function (assert) {
    const lm = { link: 'whatever' };
    this.set('lm', lm);
    await render(<template>{{lmType this.lm}}</template>);
    assert.dom(this.element).hasText('link');
  });

  test('citation', async function (assert) {
    const lm = { citation: 'whatever' };
    this.set('lm', lm);
    await render(<template>{{lmType this.lm}}</template>);
    assert.dom(this.element).hasText('citation');
  });

  test('file', async function (assert) {
    const lm = { filename: 'whatever' };
    this.set('lm', lm);
    await render(<template>{{lmType this.lm}}</template>);
    assert.dom(this.element).hasText('file');
  });
});
