import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/ics-feed';
import IcsFeed from 'ilios-common/components/ics-feed';

module('Integration | Component | ics feed', function (hooks) {
  setupRenderingTest(hooks);

  test('copy', async function (assert) {
    // skip this test if we can't access the clipboard
    if (!navigator.clipboard) {
      assert.expect(0);
      return;
    }

    assert.expect(1);
    const instructions = 'SOME TEST INS';
    const url = 'https://iliosproject.org';

    // temporarily overwrite the writeText method.
    const writeText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = (value) => {
      assert.strictEqual(value, url, 'clipboard text == url');
    };

    this.set('url', url);
    this.set('instructions', instructions);
    await render(
      <template><IcsFeed @instructions={{this.instructions}} @url={{this.url}} /></template>,
    );
    await component.copy.click();

    // undo writeText overwrite.
    navigator.clipboard.writeText = writeText;
  });
});
