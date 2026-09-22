import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import removeHtmlTags from 'ilios-common/helpers/remove-html-tags';

module('Integration | Helper | remove-html-tags', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('inputValue', '<p>Tags should</p><p> not show up</p>');

    await render(<template>{{removeHtmlTags this.inputValue}}</template>);

    assert.dom(this.element).hasText('Tags should not show up');
  });
});
