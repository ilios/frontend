import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import HtmlEditor from 'ilios-common/components/html-editor';

module('Integration | Component | html editor', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    await render(<template><HtmlEditor /></template>);

    assert.dom('.ql-toolbar').exists();
    assert.dom('.ql-editor').exists();
    assert.dom('svg').exists({ count: 9 });
  });
});
