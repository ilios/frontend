import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | lm-type', function(hooks) {
  setupRenderingTest(hooks);

  test('link', async function(assert) {
    assert.expect(1);
    let lm = { link: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type lm}}`);
    assert.dom(this.element).hasText('link');
  });

  test('citation', async function(assert) {
    assert.expect(1);
    let lm = { citation: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type lm}}`);
    assert.dom(this.element).hasText('citation');
  });

  test('file', async function(assert) {
    assert.expect(1);
    let lm = { filename: 'whatever' };
    this.set('lm', lm);
    await render(hbs`{{lm-type lm}}`);
    assert.dom(this.element).hasText('file');
  });
});
