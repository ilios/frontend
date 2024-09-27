import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/copy-button';

module('Integration | Component | copy-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('content', 'template block text');
    await render(hbs`<CopyButton>
  {{this.content}}
</CopyButton>`);

    assert.strictEqual(component.text, 'template block text');
  });

  test('copy', async function (assert) {
    //skip this test if we can't access the clipboard
    if (!navigator.clipboard) {
      assert.expect(0);
      return;
    }
    assert.expect(2);
    const text = 'lorem ipsum';
    // temporarily overwrite the writeText method.
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (value) => {
      assert.strictEqual(text, value);
    };
    this.set('text', text);
    this.set('content', 'copy this!');
    this.set('success', () => {
      assert.ok(true);
    });
    await render(hbs`<CopyButton @clipboardText={{this.text}} @success={{this.success}}>
  {{this.content}}
</CopyButton>`);
    await component.click();
    // undo writeText overwrite.
    navigator.clipboard.writeText = writeText;
  });
});
