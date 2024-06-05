import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/ics-feed';

module('Integration | Component | ics feed', function (hooks) {
  setupRenderingTest(hooks);

  test('it show instructions', async function (assert) {
    const instructions = 'SOME TEST INS';
    this.set('instructions', instructions);
    await render(hbs`<IcsFeed @instructions={{this.instructions}} />
`);
    assert.strictEqual(component.instructions, instructions);
  });

  test('copy', async function (assert) {
    //skip this test if we can't access the clipboard
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
      assert.strictEqual(value, url);
    };
    this.set('url', url);
    this.set('instructions', instructions);
    await render(hbs`<IcsFeed @instructions={{this.instructions}} @url={{this.url}} />
`);
    await component.copy.click();
    // undo writeText overwrite.
    navigator.clipboard.writeText = writeText;
  });
});
