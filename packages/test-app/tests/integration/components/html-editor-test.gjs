import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitFor } from '@ember/test-helpers';
import HtmlEditor from 'ilios-common/components/html-editor';

module('Integration | Component | html editor', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><HtmlEditor /></template>);
    await waitFor('[data-test-load-finished]');

    assert
      .dom(this.element)
      .hasText('BoldItalicSubscriptSuperscriptOrdered ListUnordered ListInsert LinkUndoRedo');
    assert.dom('svg').exists({ count: 9 });
  });
});
