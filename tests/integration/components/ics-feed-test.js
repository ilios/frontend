import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ics feed', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it show instructions', async function (assert) {
    assert.expect(1);
    const instructions = 'SOME TEST INS';
    const element = 'p:nth-of-type(1)';
    this.set('instructions', instructions);

    await render(hbs`<IcsFeed @instructions={{this.instructions}} />`);

    assert.dom(element).hasText(instructions);
  });
});
