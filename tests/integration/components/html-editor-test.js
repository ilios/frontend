import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, waitFor } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | html editor', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<HtmlEditor />`);
    await waitFor('[data-test-load-finished]');

    assert
      .dom(this.element)
      .hasText('BoldItalicSubscriptSuperscriptOrdered ListUnordered ListInsert LinkUndoRedo');
    assert.dom('svg').exists({ count: 9 });
  });
});
