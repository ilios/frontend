import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/copy-button';
import CopyButton from 'ilios-common/components/copy-button';

module('Integration | Component | copy-button', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('content', 'template block text');
    await render(
      <template>
        <CopyButton>
          {{this.content}}
        </CopyButton>
      </template>,
    );

    assert.strictEqual(component.text, 'template block text');
  });

  test('copy', async function (assert) {
    //skip this test if we can't access the clipboard
    if (!navigator.clipboard) {
      assert.expect(0);
      return;
    }
    const getClipboardText = () => {
      return 'lorem ipsum';
    };
    // temporarily overwrite the writeText method.
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (value) => {
      assert.step('writeText called');
      assert.strictEqual(getClipboardText(), value);
    };
    this.set('text', getClipboardText);
    this.set('content', 'copy this!');
    this.set('success', () => {
      assert.step('success called');
    });
    await render(
      <template>
        <CopyButton @getClipboardText={{this.text}} @success={{this.success}}>
          {{this.content}}
        </CopyButton>
      </template>,
    );
    await component.click();
    // undo writeText overwrite.
    navigator.clipboard.writeText = writeText;
    assert.verifySteps(['writeText called', 'success called']);
  });
});
