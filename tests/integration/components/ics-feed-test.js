import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/ics-feed';

module('Integration | Component | ics feed', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it show instructions', async function (assert) {
    const instructions = 'SOME TEST INS';
    this.set('instructions', instructions);
    await render(hbs`<IcsFeed @instructions={{this.instructions}} />`);
    assert.strictEqual(component.instructions, instructions);
  });

  test('copy', async function (assert) {
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
    await render(hbs`<IcsFeed @instructions={{this.instructions}} @url={{this.url}} />`);
    await component.copy.click();
    // undo writeText overwrite.
    navigator.clipboard.writeText = writeText;
  });
});
